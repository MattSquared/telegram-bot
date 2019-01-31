const TelegramBot = require('node-telegram-bot-api')
const token = require('./token').token
const bot = new TelegramBot(token, { polling: true })

// function
const SEPARATOR = '§'
const CINEMA_LIST = '0'
const CINEMA_INFO = '1'
const SHOW_LIST = '2'
const FILM_INFO = '3'
const SHOW_TIMES = '4'
const INDEX = '5'

// emoji
const CINEMA = '🏤'
const CLOCK = '🕒'
const ADDRESS = '🛣'
const FILM = '🎬'
const BACK_ARROW = '◀️'
const REVIEW = '📰'
const ROUTE = '📍'

// process centric
const pc = require('./process-centric/process_cinemas.js')
const pf = require('./process-centric/process_film.js')

// start
const startMsg = '<b>Welcome to CinemasBot</b>\nClick on the button below to get coords and search the cinema nearby'
const startKeyboard = [[{
  text: CINEMA + ' Cinema List',
  callback_data: CINEMA_LIST
}]]

bot.onText(/\/start/, (msg) => {
  // removeKeyboard(msg)
  bot.sendMessage(msg.chat.id, startMsg, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: startKeyboard
    }
  })
})

function start (msg) {
  bot.editMessageText(startMsg, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: startKeyboard
    }
  })
}

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
      pf.getFilmInfo(params[1], params[2], params[3], filmInfo, msg)
      break
    case SHOW_TIMES:
      pc.getShowTimes(params[1], params[2], params[3], timesList, msg)
      break
    case INDEX:
      start(msg)
  }
})

// cinema list
function cinemaList (cinemas, msg) {
  let cinemaBtn = []
  let btn = {}
  cinemas.forEach(function (cinema) {
    btn = {
      text: cinema.name,
      callback_data: CINEMA_INFO + SEPARATOR + cinema.id
    }

    cinemaBtn.push([btn])
  })

  btn = {
    text: BACK_ARROW + ' Back to home',
    callback_data: INDEX
  }
  cinemaBtn.push([btn])

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
  let message = '' +
    CINEMA + ' ' + cinema.name + '\n' +
    ADDRESS + ' ' + cinema.address + ', ' + cinema.city + '\n' +
    '<a href="' + cinema.map_image + '">&#8205;</a>'

  bot.editMessageText(message, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ROUTE + ' Route',
            url: cinema.map_route
          }
        ],
        [
          {
            text: FILM + ' Shows',
            callback_data: SHOW_LIST + SEPARATOR + cinema.id + SEPARATOR + getDate()
          }
        ],
        [
          {
            text: BACK_ARROW + ' Back to cinema list',
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
  let btn = {}
  films.forEach(function (film) {
    btn = {
      text: film.name,
      callback_data: FILM_INFO + SEPARATOR + film.id + SEPARATOR + film.imdb_id + SEPARATOR + cinemaId
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

// film info
function filmInfo (film, filmId, imdbId, cinemaId, msg) {
  let message = '' +
    '<b>Title:</b> ' + film.title + '\n' +
    '<b>Year:</b> ' + film.year + '\n' +
    '<b>Time:</b> ' + film.runtime + '\n' +
    '<b>Genre:</b> ' + film.genre + '\n' +
    '<b>Director:</b> ' + film.director + '\n' +
    '<b>Actors:</b> ' + film.actors + '\n' +
    '<b>Plot:</b> ' + film.plot + '\n' +
    '<b>Rating:</b> ' + film.imdbRating + '\n' +
    '<a href="' + film.poster + '">&#8205;</a>'

  bot.editMessageText(message, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: REVIEW + ' Review',
            url: film.review
          }
        ],
        [
          {
            text: CLOCK + ' Show Times',
            callback_data: SHOW_TIMES + SEPARATOR + filmId + SEPARATOR + cinemaId + SEPARATOR + imdbId
          }
        ],
        [
          {
            text: BACK_ARROW + ' Back to shows',
            callback_data: SHOW_LIST + SEPARATOR + cinemaId + SEPARATOR + getDate()
          }
        ]
      ]
    }
  })
}

function timesList (times, filmId, cinemaId, imdbId, msg) {
  let message = '' +
    '<b>' + times.name.toUpperCase() + '</b>\n\n' +
    '<b>Showings Type:</b>\n' +
    '<i>Standard</i>\n'

  times.showings.standard.forEach(function (item) {
    message += item + '\n'
  })
  message += '\n<i>3D</i>\n'
  times.showings['3D'].forEach(function (item) {
    message += item + '\n'
  })

  message += '\n<b>Days:</b>\n'
  times.show_dates.forEach(function (item) {
    message += item + '\n'
  })

  bot.editMessageText(message, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: BACK_ARROW + ' Back to movie',
            callback_data: FILM_INFO + SEPARATOR + filmId + SEPARATOR + imdbId + SEPARATOR + cinemaId
          }
        ]
      ]
    }
  })
}

function getDate () {
  let d = new Date()
  let date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()

  return date
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
