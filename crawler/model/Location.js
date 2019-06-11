'use strict'

var Location = function (data) {
  //第一層
  this.location_id = data.location_id
  this.location_name = data.location_name
  this.lat = data.lat
  this.lng = data.lng
  
  try {
    // var caption = data.edge_media_to_caption.edges[0]
    // this.caption = caption.node.text
  } catch (e) {}
  // this.comments_count = data.edge_media_to_comment.count
  // this.page_has_next = data.has_next_page
  // this.page_end_cursor = data.end_cursor
}

// Image.prototype.getThumbnail = function (size) {
//   let thumbnail = this.thumbnail_resources.find((resource) => {
//     return resource.config_width === size
//   })
//   return thumbnail.src
// }

module.exports = Location
