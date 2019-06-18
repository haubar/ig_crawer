'use strict'
const moment = require('moment')

var Data = function (data) {
  //第一層
  this.id = data.id
  this.shortcode = data.shortcode
  this.timestamp = data.taken_at_timestamp
  this.display_url = data.display_url
  this.thumbnail_src = data.thumbnail_src
  this.owner_id = data.owner.id
  this.sort = 1,
  this.enable = true,
  this.created_date = moment.unix(data.taken_at_timestamp).format('YYYY-MM-DD H:m:s')
  
  // moment(1541411221345).format('YYYY-MM-DD')
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

module.exports = Data
