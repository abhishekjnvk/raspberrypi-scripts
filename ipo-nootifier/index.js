require('dotenv').config()
const cron = require("node-cron");
const { bot } = require("./services/telegram");
const db = require("./services/db");
const { sendNotifications } = require("./services/notification");
const TABLE_NAME = {
  SUBSCRIPTIONS: "subscriptions",
};

const NOTIFICATION_CRON = process.env.NOTIFICATION_CRON_TIME || "00 09 * * *"; // daily at 9:00 AM

const subscribe = async (ctx) => {
  try {
    const chatId = ctx.message.chat.id;
    let body = {
      name: ctx.message.chat.first_name,
      username: ctx.message.chat.username,
      type: ctx.message.chat.type,
      _id: chatId,
    };
    if (!chatId) throw Error("Chat id is required");

    let getById = await db.getById(TABLE_NAME.SUBSCRIPTIONS, chatId);
    let message = "";
    if (!getById) {
      db.create(TABLE_NAME.SUBSCRIPTIONS, body);
      console.log("Subscribed by " + body.username);
      message =
        "You have been subscribed! you will get notifications for closing IPO";
    } else {
      message = "You are already subscribed!";
    }
    ctx.reply(message);
  } catch (error) {
    console.error(error);
    ctx.reply("Something went wrong");
  }
};

const unsubscribe = async (ctx) => {
  try {
    const chatId = ctx.message.chat.id;
    let userData = await db.getById(TABLE_NAME.SUBSCRIPTIONS, chatId);
    let message = "";
    if (!userData) {
      message = "You are not subscribed";
    } else {
      db.delete(TABLE_NAME.SUBSCRIPTIONS, chatId);
      message = "You have been unsubscribed!";
      console.log("Subscribed by " + userData.username);
    }

    ctx.reply(message);
  } catch (error) {
    console.error(error);
    ctx.reply("Something went wrong");
  }
};

const handleCustomMessage = async (ctx) => {
  try {
    let message = "Invalid command";
    ctx.reply(message);
  } catch (error) {
    console.error(error);
    ctx.reply("Something went wrong");
  }
};

const registerAllCommands = () => {
  bot.command("subscribe", subscribe);
  bot.command("unsubscribe", unsubscribe);
  const startMessage='Please select a command \n/subscribe - subscribe for daily ipo notifications\n/unsubscribe - unsubscribe from all notifications'
  bot.help((ctx) => ctx.reply(startMessage));
  bot.start((ctx) => ctx.reply(startMessage));

  bot.on("message", handleCustomMessage);
};

const startBot = async () => {
  // Start the bot
  registerAllCommands();
  bot.launch();
  console.log("Bot started");
};

const stopBot = async () => {
  await bot.stop();
  console.log("Bot stopped");
};

process.once("SIGINT", stopBot);
process.once("SIGTERM", stopBot);
const notificationTask = cron.schedule(NOTIFICATION_CRON, sendNotifications);
notificationTask.start();

startBot();
