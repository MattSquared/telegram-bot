const cinemasList = require('../data/cinemas.json')
const showTimeList = require('../data/times.json')

// fake coords
const coords = {
  lat: 53.4101422,
  lng: -3.0240445
}

exports.getCinemaList = function (callback, msg) {
  // header: str(lat,lng)
  cinemas = cinemasList.cinemas
  
  callback(cinemas, msg)
}

exports.getCinemaInfo = function (cinemaId, callback, msg) {
  // params: id_cinema
  // header: str(lat,lng)
  let cinema = {}
  cinemasList.cinemas.forEach(function (item) {
  	if (item.id === parseInt(cinemaId)) {
  		cinema = item
  	}
  })

  callback(cinema, msg)
}

exports.getShowList = function (cinemaId, date, callback, msg) {
	/* id: 8947, date: 2019-01-23 */
  // params: id_cineam, date
  // header: str(lat,lng)
  console.log(cinemaId)
  console.log(date)

  films = showTimeList.films

  callback(films, cinemaId, msg)
}

exports.getShowTimes = function (filmId, cinemaId, imdbId, callback, msg) {
  // params: id_film, id_cinema
  console.log(filmId)
  console.log(cinemaId)

  let times = {}
  showTimeList.films.forEach(function (item) {
    if (item.id === parseInt(filmId)) {
      times = item
    }
  })

  callback(times, filmId, cinemaId, imdbId, msg)
}
