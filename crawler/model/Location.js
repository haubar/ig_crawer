'use strict'

var Location = function (data) {
  //第一層
  this.location_id = data.location.id
  this.location_name = data.location.name
  this.lat = data.location.lat
  this.lng = data.location.lng
  this.address = data.location.address_json
  
  try {
    
  } catch (e) {}
    console.log(e)
}

module.exports = Location
