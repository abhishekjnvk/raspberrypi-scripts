const botToken = process.env.TELEGRAM_BOT_TOKEN;
if(!botToken){
  throw new Error('TELEGRAM_BOT_TOKEN is not set')
}


const { Telegraf } = require("telegraf");

const bot = new Telegraf(botToken);


module.exports = { bot }