const chalk = require("chalk");

const Logger = {
  info: (msg) => console.log(`${chalk.blue("[INFO]")} ${msg}`),
  success: (msg) => console.log(`${chalk.green("[SUCCESS]")} ${msg}`),
  error: (msg) => console.error(`${chalk.red("[ERROR]")} ${msg}`),
};

module.exports = Logger;