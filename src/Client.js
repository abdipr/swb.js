const makeWASocket = require('@whiskeysockets/baileys').default;
const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require("qrcode-terminal");
const CommandHandler = require("./CommandHandler");
const Logger = require("./Logger");

class SWBClient {
  constructor(options = {}) {
    this.prefix = options.prefix || "/";
    this.botName = options.name || "Simple WhatsApp Bot";
    this.commands = [];
    this.startTime = Date.now();

    this.init();
  }

  async init() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      auth: state,
      version,
      logger: pino({ level: 'silent' })
    });

    this.socket = socket;

    // Simpan kredensial bila ada perubahan
    socket.ev.on("creds.update", saveCreds);

    // Handle QR dan koneksi
    socket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        Logger.info("📱 Scan the following QR to login to WhatsApp:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        Logger.success(`✅ ${this.botName} connected to WhatsApp!`);
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.reason || "unknown";
        Logger.error(`❌ Connection is lost (reason: ${code})`);

        // Reconnect otomatis jika bukan logout manual
        if (
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        ) {
          Logger.info("🔁 Trying to reconnect...");
          this.init(); // restart ulang
        } else {
          Logger.warn("🔒 You have been logged out. Delete the auth_info folder to re-login.");
        }
      }
    });

    // Handle pesan masuk
    socket.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message || msg.key.fromMe) return;

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      const from = msg.key.remoteJid;
      const sender = msg.pushName || "Sender";

      Logger.info(`📩 Command from ${sender}: ${body}`);

      const command = new CommandHandler(this, msg, body, from, sender);
      await command.handle();
    });
  }

  command(cmdObj) {
    this.commands.push(cmdObj);
    Logger.info(`✅ Registered command: ${cmdObj.name}`);
  }
}

module.exports = { SWBClient };
