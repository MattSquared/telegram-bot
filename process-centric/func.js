global.usersFakeLocation = {}

// fake coords
const coords = {
  0: { // Liverpool
		lat: 53.4101422,
  	lng: -3.0240445		
	},
	1: { // Birmingham
		lat: 52.477564,
    lng: -2.0037166
	},
	2: { // Manchester
		lat: 53.4818336,
    lng: -2.2453167
	}
}

/** 
 * Return ISO date format
 */
exports.getDateTime = function () {
  let d = new Date()
  return d.toISOString()
}

/** 
 * Return coords by username
 * @param {string} username - Telegram username
 */
exports.getCoords = function (username) {
  console.log(usersLocation[username])

  // takes random coords from fake coords and save it for the current user
  if (usersFakeLocation[username] === undefined) {
  	let index = randCoords()
  	// let index = 0
  	usersFakeLocation[username] = [coords[index].lat, coords[index].lng].join(';')
  }
  return usersFakeLocation[username]
  // return usersLocation[username]
}

function randCoords () {
	return Math.floor(Math.random() * 3)
}
