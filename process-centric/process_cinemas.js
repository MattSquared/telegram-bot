const cinemasList = require('../data/cinemas.json')
const showTimeList = require('../data/times.json')

exports.getCinemaList = function (callback, msg) {
  var coords = {
    lat: 53.4101422,
    lng: -3.0240445
  }

  cinemas = cinemasList.cinemas
  
  callback(cinemas, msg)
}

exports.getCinemaInfo = function (cinemaId, callback, msg) {
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
  console.log(cinemaId)
  console.log(date)

  films = showTimeList.films

  callback(films, cinemaId, msg)
}

exports.getFilmInfo = function (filmId) {
  console.log('gnao')
}

exports.getTimes = function (filmId) {
  console.log('gnao')
}
