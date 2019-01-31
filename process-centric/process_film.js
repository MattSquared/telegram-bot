const imdbInfo = require('../data/film.json')

exports.getFilmInfo = function (filmId, imdbId, cinemaId, callback, msg) {
  film = imdbInfo[imdbId]
  callback(film, filmId, imdbId, cinemaId, msg)
}