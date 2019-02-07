const axios = require('axios')
const f = require('./func')

const MOVIE_BL = 'https://movie-business-logic.herokuapp.com/'
// const MOVIE_BL = 'http://localhost:5555/'
const CINEMA_BL = 'https://cinema-business.herokuapp.com/'

exports.getFilmInfo = function (filmId, imdbId, cinemaId, callback, msg, errorMsg, callbackQueryId) {
  axios.get(MOVIE_BL + 'movie', {
    params: {
      id: imdbId
    }
  }).then(function (response) {
    if (response.data.response.status === 200) { // movie success
      let film = response.data.data
      callback(film, filmId, imdbId, cinemaId, msg)
    } else { // movie error
      errorMsg(callbackQueryId)
      console.log(response.data.response) 
    }
  }).catch(function (error) { // movie default error
    errorMsg(callbackQueryId)
    console.log(error)
  })
}

exports.sendShowTimes = function (filmId, cinemaId, callbackQueryId, callback, msg, errorMsg) {
  let username = msg.chat.username

  if (checkMail(username)) {
    getCinemaInfo(cinemaId, username, errorMsg, callbackQueryId, function (response) {
      let cinema = response.data

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

        axios.post(MOVIE_BL + 'mailShowTimes', { // send data to BL
          user: username,
          mail: mail[username],
          body: body
        }).then(function (response) {
          if (response.data.response.status === 200) { // mailShowTimes success
            callback(true, callbackQueryId)
          } else { // mailShowTimes error
            errorMsg(callbackQueryId)
            console.log(response.data.response)
          }
        }).catch(function (error) { // mailShowTimes default error
          errorMsg(callbackQueryId)
          console.log(error)
        })
      }).catch(function (error) { // showtimes error
        errorMsg(callbackQueryId)
        console.log(error.response.statusText)
      })
    })
  } else {
    callback(false, callbackQueryId)
  }
}

exports.sendShowsTimes = function (cinemaId, date, callbackQueryId, callback, msg, errorMsg) {
  let username = msg.chat.username

  if (checkMail(username)) {
    getCinemaInfo(cinemaId, username, errorMsg, callbackQueryId, function (response) {
      let cinema = response.data

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

        axios.post(MOVIE_BL + 'mailShowsTimes', { // send data to BL
          user: username,
          mail: mail[username],
          body: body
        }).then(function (response) {
          if (response.data.response.status === 200) { // mailShowsTimes success
            callback(true, callbackQueryId)
          } else { // mailShowsTimes error
            errorMsg(callbackQueryId)
            console.log(response.data.response)
          }
        }).catch(function (error) { // mailShowsTimes default error
          errorMsg(callbackQueryId)
          console.log(error)
        })
      }).catch(function (error) { // detailedShowings error
        errorMsg(callbackQueryId)
        console.log(error.response.statusText)
        // console.log(error.response.statusText)
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

function getCinemaInfo (cinemaId, username, errorMsg, callbackQueryId, callback) {
  axios.get(CINEMA_BL + 'cinema', {
    headers: {
      position: f.getCoords(username)
    },
    params: {
      cinema_id: cinemaId
    }
  }).then(function (response) {
    if (response.status === 200) { // cinema success
      callback(response)
    } else { // cinema error
      errorMsg(callbackQueryId)
      console.log(response.statusText)
    }
  }).catch(function (error) { // cinema default error
    errorMsg(callbackQueryId)
    console.log(error)
  })
}
