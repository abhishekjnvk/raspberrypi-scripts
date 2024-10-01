const db = require("./db");
const { bot } = require("./telegram");
const scrapeTable = require("./scrap");

const sendNotifications = async () => {
  console.log("Sending notifications");
  try {
    let table = await scrapeTable(true);
    if (table.length) {
      const subscribedUsers = await db.getAll("subscriptions");
      let message = "IPO closing today:\n";
      table.forEach((ipo, index) => {
        message += `*Name:* ${ipo.ipo_name}\n\n`;
        message += `*Open:* ${ipo.open}\n`;
        message += `*Close:* ${ipo.close}\n`;
        message += `*GMP:* ${ipo.gmp}\n`;
        message += `*Amount:* ${ipo.total_price}\n`;
        message += "\n";
        if (index < table.length - 1) {
          message += "==================\n";
        }
      });

      console.log(subscribedUsers);
      subscribedUsers.forEach((user) => {
        bot.telegram.sendMessage(user._id, message, { parse_mode: "Markdown" });
      });
    } else {
      console.log("No IPOs for today");
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = { sendNotifications };
