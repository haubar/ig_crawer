'use strict'

var Data = function (data) {
  //第一層
  this.id = data.id
  this.shortcode = data.shortcode
  this.timestamp = data.taken_at_timestamp
  this.display_url = data.display_url
  this.thumbnail_src = data.thumbnail_src
  this.owner_id = data.owner.id

  
  // this.caption = null
  // this.caption = null
  // this.caption = null
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

module.exports = Data
