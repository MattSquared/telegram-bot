const axios = require('axios')
const f = require('./func')

const MOVIE_BL = 'https://movie-business-logic.herokuapp.com/'
// const MOVIE_BL = 'http://localhost:5555/'
const CINEMA_BL = 'https://cinema-business.herokuapp.com/'

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

exports.sendShowTimes = function (filmId, cinemaId, callbackQueryId, callback, msg) {
  let username = msg.chat.username

  axios.get(CINEMA_BL + 'cinema', { // get cinema info
    headers: {
      position: f.getCoords()
    },
    params: {
      cinema_id: cinemaId
    }
  }).then(function (response) {
    let cinema = response.data

    axios.get(CINEMA_BL + 'showtimes', { // get show times
      params: {
        film_id: filmId,
        cinema_id: cinema.cinema_id
      }
    }).then(function (response) {
      let times = response.data
      
      if (checkMail(username)) { // check if mail per user already exist
        let body = {
          cinema: cinema,
          times: times
        }

        axios.post(MOVIE_BL + 'sendShowTimes', { // send data to BL
          user: username,
          mail: mail[username],
          body: body
        }).then(function (response) {
          callback(true, callbackQueryId)
        }).catch(function (error) {
          console.log(error)
        })
      } else {
        callback(false, callbackQueryId)
      }
    }).catch(function (error) {
      console.log(error)
    })
  }).catch(function (error) {
    console.log(error)
  })
}

exports.sendShowsTimes = function (cinemaId, date, callbackQueryId, callback, msg) {
  let username = msg.chat.username

  axios.get(CINEMA_BL + 'cinema', { // get cinema info
    headers: {
      position: f.getCoords()
    },
    params: {
      cinema_id: cinemaId
    }
  }).then(function (response) {
    let cinema = response.data

    axios.get(CINEMA_BL + 'detailedShowings', { // get shows per cinema
      headers: {
        position: f.getCoords(),
        datetime: f.getDateTime()
      },
      params: {
        cinema_id: cinema.cinema_id,
        date: date
      }
    }).then(function (response) {
      if (checkMail(username)) { // check if mail per user already exist
        let body = {
          cinema: cinema,
          shows: response.data.films
        }

        axios.post(MOVIE_BL + 'sendShowsTimes', { // send data to BL
          user: username,
          mail: mail[username],
          body: body
        }).then(function (response) {
          callback(true, callbackQueryId)
        }).catch(function (error) {
          console.log(error)
        })
      } else {
        callback(false, callbackQueryId)
      }
    }).catch(function (error) {
      console.log(error)
    })
  }).catch(function (error) {
    console.log(error)
  })
}

function checkMail (username) {
  if (mail[username] !== undefined) {
    return true
  } else {
    return false
  }
}