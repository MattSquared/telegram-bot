const axios = require('axios')
const f = require('./func')

const CINEMA_BL = 'https://cinema-business.herokuapp.com/'

exports.getCinemaList = function (callback, msg, errorMsg, callbackQueryId) {
  // axios.get('http://localhost/cinemasBot/business_nearby.json', {
  axios.get(CINEMA_BL + 'nearby', {
    headers: {
      position: f.getCoords(msg.chat.username),
      datetime: f.getDateTime()
    }
  }).then(function (response) {
    let cinemas = response.data.cinemas
    callback(cinemas, msg)
  }).catch(function (error) {
    errorMsg(callbackQueryId)
    console.log(error)
  })
}

exports.getCinemaInfo = function (cinemaId, callback, msg, errorMsg, callbackQueryId) {
  // axios.get('http://localhost/cinemasBot/business_cinema.json')
  axios.get(CINEMA_BL + 'cinema', {
    headers: {
      position: f.getCoords(msg.chat.username)
    },
    params: {
      cinema_id: cinemaId
    }
  }).then(function (response) {
    let cinema = response.data
    callback(cinema, msg)
  }).catch(function (error) {
    errorMsg(callbackQueryId)
    console.log(error)
  })
}

exports.getShowList = function (cinemaId, date, callback, msg, errorMsg, callbackQueryId) {
  // axios.get('http://localhost/cinemasBot/business_showings.json')
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
    callback(films, cinemaId, msg)
  }).catch(function (error) {
    errorMsg(callbackQueryId)
    console.log(error)
  })
}

exports.getShowTimes = function (filmId, cinemaId, imdbId, callback, msg, errorMsg, callbackQueryId) {
  // axios.get('http://localhost/cinemasBot/business_showtimes.json')
  axios.get(CINEMA_BL + 'showtimes', {
    params: {
      film_id: filmId,
      cinema_id: cinemaId
    }
  }).then(function (response) {
    let times = response.data
    callback(times, filmId, cinemaId, imdbId, msg)
  }).catch(function (error) {
    errorMsg(callbackQueryId)
    console.log(error)
  })
}
