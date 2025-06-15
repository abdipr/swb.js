# swb.js

`swb.js` is a lightweight, beginner-friendly WhatsApp bot framework built on top of [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys). It provides a simple command-based interface, inspired by the ease of use of libraries like `aoi.js`, allowing developers to build WhatsApp bots quickly and efficiently.

## ⚠️ Disclaimer

`swb.js` is currently in early development and may not be production-ready. Some features are experimental, and breaking changes may occur as the project evolves.

We welcome all contributions, feedback, and suggestions to help improve the library. If you’d like to be part of its growth, feel free to open an issue, submit a pull request, or star the project on GitHub.

Together, we can make `swb.js` better for everyone. 💚

---

## 🪙 Support

If you like this project, please star on this repository, thank you ⭐<br>
You can support me by:<br>
<a href="https://trakteer.id/abdipr" target="_blank"><img id="wse-buttons-preview" src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png?date=18-11-2023" height="40" style="border: 0px; height: 40px;" alt="Trakteer Saya"></a>
<a href="https://saweria.co/abdipr" target="_blank"><img height="42" src="https://files.catbox.moe/fwpsve.png"></a>

---

## ✨ Features

- ⚡ Simple command system with `$variables`
- 📸 Fetch profile picture, about, last seen, and more
- ⏱️ Built-in uptime, latency, date/time utilities
- 📚 Fully customizable prefix and bot name
- 🧩 Easily extendable and maintainable

---

## 📦 Installation

```bash
npm install swb.js
````

---

## 🚀 Quick Start

Create a new file `index.js`:

```js
const { SWBClient } = require("swb.js");

const bot = new SWBClient({
  prefix: "/",          // Command prefix (default: /)
  name: "MyBot",        // Bot name (optional)
});

// Simple ping command
bot.command({
  name: "ping",
  code: "Pong!"
});

// Greeting the sender
bot.command({
  name: "hello",
  code: "Hello $senderName, I am $botName."
});

// Show current uptime
bot.command({
  name: "uptime",
  code: "⏱ Bot has been active for $uptime."
});

// Random number
bot.command({
  name: "random",
  code: "🎲 Your lucky number is: $random[1;100]"
});

// Show info about yourself
bot.command({
  name: "me",
  code: `
🧍 *Your Number:* $number
📝 *About:* $about
📷 *PP URL:* $ppUrl
🕒 *Last Seen:* $lastSeen
  `
});
```

Then just run:

```bash
node index.js
```

---

## 🔧 Supported Variables

| Variable           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `$senderName`      | Name of the message sender                           |
| `$botName`         | The name you set for your bot                        |
| `$botNumber`       | The phone number of your bot                         |
| `$uptime`          | How long the bot has been running                    |
| `$latency`         | Message latency in milliseconds                      |
| `$now`             | Current time (`Asia/Jakarta`)                        |
| `$day[timezone]`   | Current weekday (default: Asia/Jakarta)              |
| `$date[timezone]`  | Current date (default: Asia/Jakarta)                 |
| `$args[n]`         | Argument at index `n` (e.g., `$args[0]`)             |
| `$random[min;max]` | Random number between `min` and `max` (default: 0–9) |
| `$upper[text]`     | Convert text to uppercase                            |
| `$lower[text]`     | Convert text to lowercase                            |

---

## 📱 WhatsApp Specific Variables

| Variable         | Description                       |
| ---------------- | --------------------------------- |
| `$number`        | Your number (without domain)      |
| `$number[num]`   | Target number                     |
| `$about`         | Your "about" info                 |
| `$about[num]`    | Target's "about" info             |
| `$ppUrl`         | Your profile picture URL          |
| `$ppUrl[num]`    | Target's profile picture URL      |
| `$lastSeen`      | Your last seen (if available)     |
| `$lastSeen[num]` | Target's last seen (if available) |
| `$mention[n]`    | Mentioned user at index `n`       |
| `$groupName`     | Current group name (if in group)  |
| `$groupDesc`     | Group description (if in group)   |
| `$groupId`       | Group ID (JID)                    |

---

## 📂 Folder Structure (Recommended)

```
swb-bot/
├── index.js          # Main bot file
├── package.json
└── node_modules/
```

---

## 💡 Tips

* To test group features, make sure to add your bot to a WhatsApp group.
* To use `$mention`, mention someone when calling the command.
* Commands are case-insensitive (e.g., `/PING` works the same as `/ping`).

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## 🛠 Built With

* [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API library
* Node.js

---

## 🤝 Contributing

Pull requests and feature suggestions are welcome! Feel free to open an issue or submit a PR if you have something to add.