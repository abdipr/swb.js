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

    const response = cmd.code
      .replace(/\$pingms/g, `${Math.floor(Math.random() * 100)}ms`)
      .replace(/\$senderName/g, this.senderName)
      .replace(/\$uptime/g, () => {
        const ms = Date.now() - this.client.startTime;
        const s = Math.floor(ms / 1000) % 60;
        const m = Math.floor(ms / 1000 / 60) % 60;
        const h = Math.floor(ms / 1000 / 60 / 60);
        return `${h}h ${m}m ${s}s`;
      })
      .replace(/\$botName/g, this.client.botName)
      .replace(/\$args\[(\d+)\]/g, (_, idx) => args[idx] || "")
      .replace(/\$random\[(\d+);(\d+)\]/g, (_, min, max) => {
        const nMin = parseInt(min),
          nMax = parseInt(max);
        return Math.floor(Math.random() * (nMax - nMin + 1)) + nMin;
      });

    const shouldReply = cmd.reply !== false;
    const sendOptions = shouldReply ? { quoted: this.msg } : {};
    await socket.sendMessage(this.from, { text: response.trim() }, sendOptions);
  }
}

module.exports = CommandHandler;
