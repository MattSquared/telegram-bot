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
const SHOW_MAIL = '6'
const SHOWS_MAIL = '7'

// emoji
const CINEMA = '🏤'
const CLOCK = '🕒'
const ADDRESS = '🛣'
const FILM = '🎬'
const BACK_ARROW = '◀️'
const REVIEW = '📰'
const ROUTE = '📍'
const MAIL = '📧'
const PHONE = '☎️'
const SITE = '🖥'
const FACEBOOK = '💙'
const INSTAGRAM = '❤️'
const TWITTER = '💜'

// process centric
const pc = require('./process-centric/process_cinemas.js')
const pf = require('./process-centric/process_film.js')

// dict for users mail address
global.mail = {}

// start
const startMsg = '<b>Welcome to CinemasBot</b>\nClick on the button below to search the cinema nearby'
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
    case SHOW_MAIL:
      pf.sendShowTimes(params[1], params[2], callbackQuery.id, sendMail, msg)
    case SHOWS_MAIL:
      pf.sendShowsTimes(params[1], params[2], callbackQuery.id, sendMail, msg)
  }
})

// cinema list
function cinemaList (cinemas, msg) {
  let cinemaBtn = []
  let btn = {}
  cinemas.forEach(function (cinema) {
    btn = {
      text: cinema.cinema_name,
      callback_data: CINEMA_INFO + SEPARATOR + cinema.cinema_id
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
    CINEMA + ' ' + cinema.cinema_name + '\n' +
    ADDRESS + ' ' + cinema.address + ', ' + cinema.city + '\n' +
    PHONE + ' ' + setNa(cinema.contact.formattedPhone) + '\n' +
    '<a href="' + cinema.map_image + '">&#8205;</a>' +
    SITE + ' ' + setNa(cinema.url) + '\n'

  let faceUser = cinema.contact.facebookUsername
  if (faceUser !== 'null') {
    message += FACEBOOK + ' <a href="https://www.facebook.com/' + faceUser + '">Facebook</a>\n'
  }

  let instaUser = cinema.contact.instagram
  if (instaUser !== 'null') {
    message += INSTAGRAM + ' <a href="https://www.instagram.com/' + instaUser + '">Instagram</a>\n'
  }

  let twitterUser = cinema.contact.twitter
  if (twitterUser !== 'null') {
    message += TWITTER + ' <a href="https://twitter.com/' + twitterUser + '">Twitter</a>\n'
  }

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
            callback_data: SHOW_LIST + SEPARATOR + cinema.cinema_id + SEPARATOR + getDate()
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
      text: film.film_name,
      callback_data: FILM_INFO + SEPARATOR + film.film_id + SEPARATOR + film.imdb_id + SEPARATOR + cinemaId
    }

    filmBtn.push([btn])
  })

  btn = {
    text: MAIL + ' Send shows times to email',
    callback_data: SHOWS_MAIL + SEPARATOR + cinemaId + SEPARATOR + getDate()
  }
  filmBtn.push([btn])

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
    '<b>' + times.film_name.toUpperCase() + '</b>\n\n' +
    '<b>Showings Type:</b>\n' +
    '<i>Standard</i>\n'

  times.showings.standard.forEach(function (item) {
    message += item + '\n'
  })

  if (times.showings['3D'] !== undefined) {
    message += '\n<i>3D</i>\n'
    times.showings['3D'].forEach(function (item) {
      message += item + '\n'
    })
  }

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
            text: MAIL + ' Send movie showings to email',
            callback_data: SHOW_MAIL + SEPARATOR + filmId + SEPARATOR + cinemaId
          }
        ],
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

function sendMail (status, callbackQueryId) {
  if (status) {
    bot.answerCallbackQuery(callbackQueryId, {
      text: 'Mail sent successfully!',
      show_alert: true
    })
  } else {
    bot.answerCallbackQuery(callbackQueryId, {
      text: 'Mail is not already registered, please type /mail <mail>, then retry',
      show_alert: true
    })
  }
}

bot.onText(/\/mail (.+)/, (msg, match) => {
  mail[msg.chat.username] = match[1]
  bot.sendMessage(msg.chat.id, 'Mail ' + mail[msg.chat.username] + ' added successfully!')/* .then((msg) => {
    deleteMsg(msg, 5000)
  }) */
})

function getDate () {
  let d = new Date()
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2)
}

function setNa (str) {
  return str === 'null' ? 'N/A' : str
}

/* function deleteMsg (msg, timeout) {
  setTimeout(function () {
    bot.deleteMessage(msg.chat.id, msg.message_id)
  }, timeout)
} */
// remove keyboard
/*
function removeKeyboard(msg) {
  bot.sendMessage(msg.chat.id, 'clean', { reply_markup: { remove_keyboard: true } })
}
*/

// editMessageReplayMarkup modificare tastiera

// passo i vari parametri come oggetto
// bot.editMessageText("Partita eliminata", {chat_id:chat_id, message_id:message_id, reply_markup:{}})
