const axios = require('axios')
const MOVIE_BL = 'https://movie-business-logic.herokuapp.com/'
// const TEST_URL = 'http://localhost:5555/'

const cinemasList = require('../data/cinemas.json')
const showTimeList = require('../data/times.json')
const responseList = require('../data/response.json')

exports.getFilmInfo = function (filmId, imdbId, cinemaId, callback, msg) {
  axios.get(MOVIE_BL + 'getMovieInfo', {
    params: {
      id: imdbId
    }
  }).then(function (response) {
  	let film = response.data
  	callback(film, filmId, imdbId, cinemaId, msg)
  }).catch(function (error) {
    console.log(error)
  })
}

exports.sendShowTimes = function (filmId, cinemaId, callback, msg) {
  // params: id_film, id_cinema
  let username = msg.chat.username

  let times = {}
  showTimeList.films.forEach(function (item) {
    if (item.id === parseInt(filmId)) {
      times = item
    }
  })

  let cinema = {}
  cinemasList.cinemas.forEach(function (item) {
    if (item.id === parseInt(cinemaId)) {
      cinema = item
    }
  })

  if (checkMail(username)) {
    let body = {
      cinema: cinema,
      times: times
    }

    axios.post(TEST_URL + 'sendShowTimes', {
      user: username,
      mail: mail[username],
      body: body
    }).then(function (response) {
      callback(true, msg)
    }).catch(function (error) {
      console.log(error.status)
    })
  } else {
    callback(false, msg)
  }
}

exports.sendShowsTimes = function (cinemaId, date, callback, msg) {
  let username = msg.chat.username

  let cinema = {}
  cinemasList.cinemas.forEach(function (item) {
    if (item.id === parseInt(cinemaId)) {
      cinema = item
    }
  })

  if (checkMail(username)) {
    let body = {
      cinema: cinema,
      shows: responseList.films
    }

    axios.post(MOVIE_BL + 'sendShowsTimes', {
      user: username,
      mail: mail[username],
      body: body
    }).then(function (response) {
      callback(true, msg)
    }).catch(function (error) {
      console.log(error.status)
    })
  } else {
    callback(false, msg)
  }
}

function checkMail (username) {
  if (mail[username] !== undefined) {
    return true
  } else {
    return false
  }
}