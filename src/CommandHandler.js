const { getContentType } = require("@whiskeysockets/baileys");

class CommandHandler {
  constructor(client, msg, body, from, senderName) {
    this.client = client;
    this.msg = msg;
    this.body = body;
    this.from = from;
    this.senderName = senderName;
  }

  async handle() {
    const { prefix, commands, socket } = this.client;
    if (!this.body.startsWith(prefix)) return;

    const args = this.body.slice(prefix.length).trim().split(" ");
    const cmdName = args.shift().toLowerCase();
    const cmd = commands.find((c) => c.name === cmdName);
    if (!cmd) return;

    const senderId = this.msg.key.participant || this.msg.key.remoteJid;
    const defaultId = senderId.split(":")[0].split("@")[0] + "@s.whatsapp.net";

    // Preload WA info
    const dynamicTargets = [
      ...cmd.code.matchAll(/\$(ppUrl|number|about|lastSeen)(?:\[(.*?)\])?/g),
    ];
    const infoCache = {};
    for (const [, , numRaw] of dynamicTargets) {
      const id = numRaw ? numRaw.replace(/\D/g, "") + "@s.whatsapp.net" : defaultId;
      if (!infoCache[id]) {
        infoCache[id] = {
          ppUrl: await socket.profilePictureUrl(id, "image").catch(() => null),
          about: await socket.fetchStatus(id).catch(() => null),
          lastSeen: await socket.presenceSubscribe(id).then(async () => {
            await new Promise((r) => setTimeout(r, 1000));
            return socket.presence[id];
          }).catch(() => null),
        };
      }
    }

    // Ambil group metadata jika group
    let groupMetadata = null;
    if (this.msg.key.remoteJid.endsWith("@g.us")) {
      groupMetadata = await socket.groupMetadata(this.msg.key.remoteJid).catch(() => null);
    }

    // Format response
    let response = cmd.code
      .replace(/\$latency/g, () => {
        const latency = Date.now() - this.msg.messageTimestamp * 1000;
        return `${latency}ms`;
      })
      .replace(/\$senderName/g, this.senderName)
      .replace(/\$uptime/g, () => {
        const ms = Date.now() - this.client.startTime;
        const s = Math.floor(ms / 1000) % 60;
        const m = Math.floor(ms / 1000 / 60) % 60;
        const h = Math.floor(ms / 1000 / 60 / 60);
        return `${h}h ${m}m ${s}s`;
      })
      .replace(/\$now/g, () => {
        return new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour12: false });
      })
      .replace(/\$day(?:\[(.*?)\])?/g, (_, tz) => {
        const timeZone = tz || "Asia/Jakarta";
        try {
          return new Date().toLocaleDateString("en-US", {
            timeZone,
            weekday: "long",
          });
        } catch {
          return `[Invalid timezone: ${tz}]`;
        }
      })
      .replace(/\$date(?:\[(.*?)\])?/g, (_, tz) => {
        const timeZone = tz || "Asia/Jakarta";
        try {
          return new Date().toLocaleDateString("en-US", {
            timeZone,
          });
        } catch {
          return `[Invalid timezone: ${tz}]`;
        }
      })
      .replace(/\$upper\[(.+?)\]/g, (_, text) => text.toUpperCase())
      .replace(/\$lower\[(.+?)\]/g, (_, text) => text.toLowerCase())
      .replace(/\$args\[(\d+)\]/g, (_, idx) => args[idx] || "")
      .replace(/\$random(?:\[(\d*);?(\d*)\])?/g, (_, min, max) => {
        const nMin = min ? parseInt(min) : 0;
        const nMax = max ? parseInt(max) : 9;
        return Math.floor(Math.random() * (nMax - nMin + 1)) + nMin;
      })
      .replace(/\$botNumber/g, socket.user.id.replace(/:.*?@/, "@").replace("@s.whatsapp.net", ""))
      .replace(/\$botName/g, this.client.botName)
      .replace(/\$mention(?:\[(\d+)\])?/g, (_, idx) => {
        const mentions = this.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const index = parseInt(idx || 0);
        return mentions[index]?.replace("@s.whatsapp.net", "") || "[No mention]";
      })
      .replace(/\$groupName/g, groupMetadata?.subject || "[Group Name Unavailable]")
      .replace(/\$groupId/g, this.msg.key.remoteJid || "[Unknown Group ID]")
      .replace(/\$ppUrl(?:\[(.*?)\])?/g, (_, num) => {
        const id = num ? num.replace(/\D/g, "") + "@s.whatsapp.net" : defaultId;
        return infoCache[id]?.ppUrl || "[No profile picture]";
      })
      .replace(/\$number(?:\[(.*?)\])?/g, (_, num) => {
        const id = num ? num.replace(/\D/g, "") + "@s.whatsapp.net" : defaultId;
        return id.replace("@s.whatsapp.net", "");
      })
      .replace(/\$about(?:\[(.*?)\])?/g, (_, num) => {
        const id = num ? num.replace(/\D/g, "") + "@s.whatsapp.net" : defaultId;
        return infoCache[id]?.about?.status || "[No about set]";
      })
      .replace(/\$lastSeen(?:\[(.*?)\])?/g, (_, num) => {
        const id = num ? num.replace(/\D/g, "") + "@s.whatsapp.net" : defaultId;
        const seen = infoCache[id]?.lastSeen?.lastSeen;
        return seen
          ? new Date(seen * 1000).toLocaleTimeString("en-US", { hour12: false })
          : "[Unknown last seen]";
      });

    // Khusus $groupDesc karena async
    if (response.includes("$groupDesc")) {
      const desc = groupMetadata?.desc || "[No group description]";
      response = response.replace(/\$groupDesc/g, desc);
    }

    const shouldReply = cmd.reply !== false;
    const sendOptions = shouldReply ? { quoted: this.msg } : {};
    await socket.sendMessage(this.from, { text: response.trim() }, sendOptions);
  }
}

module.exports = CommandHandler;