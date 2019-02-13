const axios = require('axios')
const f = require('./func')

const CINEMA_BL = 'https://cinema-business.herokuapp.com/'

/**
 * Return list of cinemas nearby (result depends of coords value)
 * @param {fucntion} callback - callback function
 * @param {Message} msg - Telegram Message object
 * @param {function} errorMsg - error function
 * @param {int} callbackQueryId - id of Telegram callbackQuery
 */
exports.getCinemaList = function (callback, msg, errorMsg, callbackQueryId) {
  axios.get(CINEMA_BL + 'nearby', {
    headers: {
      position: f.getCoords(msg.chat.username),
      datetime: f.getDateTime()
    }
  }).then(function (response) {
    let cinemas = response.data.cinemas
    callback(cinemas, msg, callbackQueryId)
  }).catch(function (error) { // nearby error
    errorMsg(callbackQueryId)
    console.log(error.response.statusText)
  })
}

/**
 * Return information of a cinema by its id
 * @param {int} cinemaId
 * @param {fucntion} callback - callback function
 * @param {Message} msg - Telegram Message object
 * @param {function} errorMsg - error function
 * @param {int} callbackQueryId - id of Telegram callbackQuery
 */
exports.getCinemaInfo = function (cinemaId, callback, msg, errorMsg, callbackQueryId) {
  axios.get(CINEMA_BL + 'cinema', {
    headers: {
      position: f.getCoords(msg.chat.username)
    },
    params: {
      cinema_id: cinemaId
    }
  }).then(function (response) {
    let cinema = response.data
    callback(cinema, msg, callbackQueryId)
  }).catch(function (error) { // cinema error
    errorMsg(callbackQueryId)
    console.log(error.response.statusText)
  })
}

/**
 * Return showings list of a cinema by its id and the date
 * @param {int} cinemaId
 * @param {string} date - format: YYYY-MM-DD
 * @param {fucntion} callback - callback function
 * @param {Message} msg - Telegram Message object
 * @param {function} errorMsg - error function
 * @param {int} callbackQueryId - id of Telegram callbackQuery
 */
exports.getShowList = function (cinemaId, date, callback, msg, errorMsg, callbackQueryId) {
  axios.get(CINEMA_BL + 'showings', {
    headers: {
      position: f.getCoords(msg.chat.username),
      datetime: f.getDateTime()
    },
    params: {
      cinema_id: cinemaId,
      date: date
    }
  }).then(function (response) {
    let films = response.data.films
    callback(films, cinemaId, msg, callbackQueryId)
  }).catch(function (error) { // showings error
    errorMsg(callbackQueryId)
    console.log(error.response.statusText)
  })
}

/**
 * Return show times list of a film by its id and the id of the cinema
 * @param {int} filmId
 * @param {int} cinemaId
 * @param {string} imdbId - movie id takes from http://imdb.com (used for the back button)
 * @param {fucntion} callback - callback function
 * @param {Message} msg - Telegram Message object
 * @param {function} errorMsg - error function
 * @param {int} callbackQueryId - id of Telegram callbackQuery
 */
exports.getShowTimes = function (filmId, cinemaId, imdbId, callback, msg, errorMsg, callbackQueryId) {
  axios.get(CINEMA_BL + 'showtimes', {
    params: {
      film_id: filmId,
      cinema_id: cinemaId
    }
  }).then(function (response) {
    let times = response.data.showtimes
    callback(times, filmId, cinemaId, imdbId, msg, callbackQueryId)
  }).catch(function (error) { // showtimes error
    errorMsg(callbackQueryId)
    console.log(error.response.statusText)
  })
}
