'use strict'

var Location = function (data) {
  //第一層
  this.location_id = data.id
  this.location_name = data.name
  this.lat = data.lat
  this.lng = data.lng
  this.address = data.address_json
  this.on_place = true
  
  try {
    
  } catch (e) {}
    // console.log(e)
}

module.exports = Location
