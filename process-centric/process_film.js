const axios = require('axios')
const f = require('./func')

const MOVIE_BL = 'https://movie-business-logic.herokuapp.com/'
// const MOVIE_BL = 'http//localhost:5555/'
const CINEMA_BL = 'https://cinema-business.herokuapp.com/'

exports.getFilmInfo = function (filmId, imdbId, cinemaId, callback, msg, errorMsg, callbackQueryId) {
  axios.get(MOVIE_BL + 'getMovieInfo', {
    params: {
      id: imdbId
    }
  }).then(function (response) {
    let film = response.data
    callback(film, filmId, imdbId, cinemaId, msg)
  }).catch(function (error) {
    errorMsg(callbackQueryId)
    console.log(error)
  })
}

exports.sendShowTimes = function (filmId, cinemaId, callbackQueryId, callback, msg, errorMsg, callbackQueryId) {
  let username = msg.chat.username

  if (checkMail(username)) {
    getCinemaInfo(cinemaId, username, errorMsg, callbackQueryId, function (response) {
      let cinema = response.data

      // axios.get('http://localhost/cinemasBot/business_showtimes.json')
      axios.get(CINEMA_BL + 'showtimes', { // get show times
        params: {
          film_id: filmId,
          cinema_id: cinema.cinema_id
        }
      }).then(function (response) {
        let times = response.data
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
          errorMsg(callbackQueryId)
          console.log(error)
        })
      }).catch(function (error) {
        errorMsg(callbackQueryId)
        console.log(error)
      })
    })
  } else {
    callback(false, callbackQueryId)
  }
}

exports.sendShowsTimes = function (cinemaId, date, callbackQueryId, callback, msg, errorMsg, callbackQueryId) {
  let username = msg.chat.username

  if (checkMail(username)) {
    getCinemaInfo(cinemaId, username, errorMsg, callbackQueryId, function (response) {
      let cinema = response.data

      // axios.get('http://localhost/cinemasBot/business_detailed.json')
      axios.get(CINEMA_BL + 'detailedShowings', { // get shows per cinema
        headers: {
          position: f.getCoords(username),
          datetime: f.getDateTime()
        },
        params: {
          cinema_id: cinema.cinema_id,
          date: date
        }
      }).then(function (response) {
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
          errorMsg(callbackQueryId)
          console.log(error)
        })
      }).catch(function (error) {
        errorMsg(callbackQueryId)
        console.log(error)
      })
    })
  } else {
    callback(false, callbackQueryId)
  }
}

function checkMail (username) {
  if (mail[username] !== undefined) {
    return true
  } else {
    return false
  }
}

function getCinemaInfo (cinemaId, username, callback, errorMsg, callbackQueryId) {
  // axios.get('http://localhost/cinemasBot/business_cinema.json')
  axios.get(CINEMA_BL + 'cinema', {
    headers: {
      position: f.getCoords(username)
    },
    params: {
      cinema_id: cinemaId
    }
  }).then(function (response) {
    callback(response)
  }).catch(function (error) {
    errorMsg(callbackQueryId)
    console.log(error)
  })
}
