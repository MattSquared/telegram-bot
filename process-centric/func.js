// fake coords
const coords = {
  lat: 53.4101422,
  lng: -3.0240445
}

exports.getDateTime = function () {
  let d = new Date()
  return d.toISOString()
}

exports.getCoords = function (username) {
  console.log(usersLocation[username])
  // return usersLocation[username]
  return coords.lat + ';' + coords.lng
}
