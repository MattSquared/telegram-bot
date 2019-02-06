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
const SHOW_MAIL = '5'
const SHOWS_MAIL = '6'

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

// global dicts using as caches
global.mail = {}
global.usersLocation = {}

// start bot
bot.onText(/\/start/, (msg) => {
  // removeKeyboard(msg)
  let message = '<b>Welcome to CinemasBot</b>\nClick on the button below to register your location ' +
    'or use <i>/setCoords &lt;latitude&gt ; &lt;longitude&gt</i> if using desktop version'

  // added location button
  let option = {
    'parse_mode': 'HTML',
    'reply_markup': {
      'one_time_keyboard': true,
      'keyboard': [[{
        text: ROUTE + ' Register your location',
        request_location: true
      }]]
    }
  }
  bot.sendMessage(msg.chat.id, message, option).then(() => {
    bot.on('location', (msg) => {
      bot.sendMessage(msg.chat.id, '<b>Coords registered</b>\nIf you want update your location click again on the button or use /setCoords', {
        parse_mode: 'HTML'
      }).then(() => {
        // register user coords
        usersLocation[msg.chat.username] = [msg.location.latitude, msg.location.longitude].join(';')
        start(msg)
      })
    })
  })
})

// insert mail
bot.onText(/\/mail (.+)/, (msg, match) => {
  mail[msg.chat.username] = match[1]
  bot.sendMessage(msg.chat.id, ' ' + mail[msg.chat.username] + ' added successfully!')
})

// insert coords manually for desktop version
bot.onText(/\/setCoords (.+)/, (msg, match) => {
  if (match[1].includes(';')) {
    usersLocation[msg.chat.username] = match[1]
    bot.sendMessage(msg.chat.id, '<b>Coords registered</b>\nIf you want update your location click again on the button or use /setCoords', {
      parse_mode: 'HTML'
    }).then(() => {
      start(msg)
    })
  } else {
    bot.sendMessage(msg.chat.id, 'Syntax error\nCorrect syntax: <i>/setCoords &lt;latitude&gt ; &lt;longitude&gt</i>', {
      parse_mode: 'HTML'
    })
  }
})

// button calls
bot.on('callback_query', (callbackQuery) => {
  let msg = callbackQuery.message

  if (usersLocation[msg.chat.username] !== undefined) { // before do any action, check if user location is already registered
    let params = callbackQuery.data.split(SEPARATOR)

    switch (params[0]) {
      case CINEMA_LIST:
        pc.getCinemaList(cinemaList, msg, errorMsg, callbackQuery.id)
        break
      case CINEMA_INFO:
        pc.getCinemaInfo(params[1], cinemaInfo, msg, errorMsg, callbackQuery.id)
        break
      case SHOW_LIST:
        pc.getShowList(params[1], params[2], showList, msg, errorMsg, callbackQuery.id)
        break
      case FILM_INFO:
        pf.getFilmInfo(params[1], params[2], params[3], filmInfo, msg, errorMsg, callbackQuery.id)
        break
      case SHOW_TIMES:
        pc.getShowTimes(params[1], params[2], params[3], timesList, msg, errorMsg, callbackQuery.id)
        break
      case SHOW_MAIL:
        pf.sendShowTimes(params[1], params[2], callbackQuery.id, sendMail, msg, errorMsg)
        break
      case SHOWS_MAIL:
        pf.sendShowsTimes(params[1], params[2], callbackQuery.id, sendMail, msg, errorMsg)
        break
    }
  } else {
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Please register your coords before do any action',
      show_alert: true
    })
  }
})

// first button action
function start (msg) {
  // message is sended after coords are insterted
  bot.sendMessage(msg.chat.id, 'Click on the button below to search the cinema nearby you', {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{
        text: CINEMA + ' Cinema List',
        callback_data: CINEMA_LIST
      }]]
    }
  })
}

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

  bot.editMessageText('<b>Cinema Nearby</b>', {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: cinemaBtn
    }
  })
}

// cinema info
function cinemaInfo (cinema, msg) {
  let message = '' +
    '<a href="' + cinema.map_image + '">&#8205;</a>' + // empty char (bot shows the preview only of the FIRST link that it find)
    CINEMA + ' ' + cinema.cinema_name + '\n' +
    ADDRESS + ' ' + cinema.address + ', ' + cinema.city + '\n'

  let phone = cinema.contact.formattedPhone
  if (phone !== 'null') {
    message += PHONE + ' ' + cinema.contact.formattedPhone + '\n'
  }

  let site = cinema.url
  if (site !== 'null') {
    message += SITE + ' ' + cinema.url + '\n'
  }

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

  if (cinema.hours !== 'null') {
    message += '\nHours:\n'
    cinema.hours.forEach(function (hour) {
      message += hour + '\n'
    })
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

  bot.editMessageText('<b>Shows</b>', {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'HTML',
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

  times.showings.Standard.forEach(function (item) {
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

// send mail status alert
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

function errorMsg(callbackQueryId) {
  bot.answerCallbackQuery(callbackQueryId, {
    text: 'Something was wrong, please try again!',
    show_alert: true
  })
}

function getDate () {
  let d = new Date()
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2)
}

// utility programming bot information and function

/* function deleteMsg (msg, timeout) {
  setTimeout(function () {
    bot.deleteMessage(msg.chat.id, msg.message_id)
  }, timeout)
} */
// remove keyboard

/* function removeKeyboard(msg) {
  bot.sendMessage(msg.chat.id, 'clean', { reply_markup: { remove_keyboard: true } })
} */

// editMessageReplayMarkup modificare tastiera

// passo i vari parametri come oggetto
// bot.editMessageText('Partita eliminata', {chat_id:chat_id, message_id:message_id, reply_markup:{}})

/* bot.onText(/^\/getCoords/, function (msg, match) {
  var option = {
    'parse_mode': 'Markdown',
    'reply_markup': {
      'one_time_keyboard': true,
      'keyboard': [[{
          text: ROUTE + ' My location',
          request_location: true
      }]]
    }
  }
  bot.sendMessage(msg.chat.id, 'Click on the button above to register your location', option).then(() => {
    bot.on('location', (msg) => {
      bot.sendMessage(msg.chat.id, 'Coords registered').then(() => {
        usersLocation[msg.chat.username] = [msg.location.latitude, msg.location.longitude].join(';')
      })
    })
  })
}) */
