const TelegramBot = require('node-telegram-bot-api')
const token = require('./token.json').token
const bot = new TelegramBot(token, {polling: true})

bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, 'Ciaooooooooooooooooooooo.')
})