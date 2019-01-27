const TelegramBot = require('node-telegram-bot-api')
const token = require('./token.json').token
const bot = new TelegramBot(token, { polling: true })

// function
const SEPARATOR = '§'
const CINEMA_LIST = '0'
const CINEMA_INFO = '1'
const SHOW_LIST = '2'
const FILM_INFO = '3'
const SHOW_TIMES = '4'

// emoji
const CINEMA = '🏤'
const CLOCK = '🕒'
const ADDRESS = '🛣'
const FILM = '🎬'
const BACK_ARROW = '◀️'

// process centric
const pc = require('./process-centric/process_cinemas.js')

// start
bot.onText(/\/start/, (msg) => {
  // removeKeyboard(msg)
  bot.sendMessage(msg.chat.id, 'Welcome to CinemasBot', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: CINEMA + ' Cinema List',
          callback_data: CINEMA_LIST
        }
      ]]
    }
  })
})

// button calls
bot.on('callback_query', (callbackQuery) => {
  let msg = callbackQuery.message
  let params = callbackQuery.data.split(SEPARATOR)

  switch (params[0]) {
    case CINEMA_LIST:
      pc.getCinemaList(cinemaList, msg)
      break
    case CINEMA_INFO:
      pc.getCinemaInfo(params[1], cinemaInfo, msg)
      break
    case SHOW_LIST:
      pc.getShowList(params[1], params[2], showList, msg)
      break
    case FILM_INFO:
      pc.getFilmInfo(params[1], params[2], filmInfo, msg)
      break
    case SHOW_TIMES:
      pc.getTimes(240900)
      break
  }
})

// cinema list
function cinemaList (cinemas, msg) {
  let cinemaBtn = []
  cinemas.forEach(function (cinema) {
    let btn = {
      text: cinema.name,
      callback_data: CINEMA_INFO + SEPARATOR + cinema.id
    }

    cinemaBtn.push([btn])
  })

  bot.editMessageText('Cinema Nearby', {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    reply_markup: {
      inline_keyboard: cinemaBtn
    }
  })
}

// cinema info
function cinemaInfo (cinema, msg) {
  let d = new Date()
  let date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()

  let message = '' +
    CINEMA + ' ' + cinema.name + '\n' +
    ADDRESS + ' ' + cinema.address + ', ' + cinema.city + '\n' +
    '<a href="' + cinema.logo_url + '">&#8205;</a>'

  bot.editMessageText(message, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: FILM + ' Shows',
            callback_data: SHOW_LIST + SEPARATOR + cinema.id + SEPARATOR + date
          }
        ],
        [
          {
            text: CINEMA + ' Cinema List',
            callback_data: CINEMA_LIST
          }
        ]
      ]
    }
  })
}

// show list
function showList (films, cinemaId, msg) {
  let filmBtn = []
  films.forEach(function (film) {
    let btn = {
      text: film.name,
      callback_data: FILM_INFO + SEPARATOR + film.id + SEPARATOR + film.imdb_id
    }

    filmBtn.push([btn])
  })

  btn = {
    text: BACK_ARROW + ' Back to cinema',
    callback_data: CINEMA_INFO + SEPARATOR + cinemaId
  }
  filmBtn.push([btn])

  bot.editMessageText('Shows', {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    reply_markup: {
      inline_keyboard: filmBtn
    }
  })
}

// film info TODO
function filmInfo (film, filmId, msg) {
  let message = '' +
    CINEMA + ' ' + cinema.name + '\n' +
    ADDRESS + ' ' + cinema.address + ', ' + cinema.city + '\n' +
    '<a href="' + cinema.logo_url + '">&#8205;</a>'

  bot.editMessageText(message, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: CLOCK + ' Show Time',
            callback_data: SHOW_TIME + SEPARATOR + cinema.id + SEPARATOR + date
          }
        ],
        [
          {
            text: FILM + ' Films',
            callback_data: FILM_LIST + SEPARATOR + cinema.id + SEPARATOR + date
          }
        ]
      ]
    }
  })
}
// remove keyboard
/*
function removeKeyboard(msg) {
  bot.sendMessage(msg.chat.id, 'clean', { reply_markup: { remove_keyboard: true } })
}
*/

// editMessageReplayMarkup modificare tastiera

// passo i vari parametri come oggetto
// bot.editMessageText("Partita eliminata", {chat_id:chat_id, message_id:message_id, reply_markup:{}})
