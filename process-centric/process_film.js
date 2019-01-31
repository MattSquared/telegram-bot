const axios = require('axios')
const MOVIE_BL = 'https://movie-business-logic.herokuapp.com/'

exports.getFilmInfo = function (filmId, imdbId, cinemaId, callback, msg) {
  axios.get(MOVIE_BL + 'getMovieInfo', {
    params: {
      id: imdbId,
    }
  }).then(function (response) {
  	let film = response.data
  	callback(film, filmId, imdbId, cinemaId, msg)
  }).catch(function (error) {
    console.log(error)
  })
}