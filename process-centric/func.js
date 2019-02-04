// fake coords
const coords = {
  lat: 53.4101422,
  lng: -3.0240445
}

exports.getDateTime = function () {
  let d = new Date()
  return d.toISOString()
}

exports.getCoords = function () {
  return coords.lat + ';' + coords.lng
}