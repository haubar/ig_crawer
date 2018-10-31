require('dotenv').config()

var mongoose = require('mongoose')
var schema = mongoose.Schema({
                    id: Number,
                    shortcode: String,
                    timestamp: Number,
                  //   dimensions_width: Number,
                  //   dimensions_height: Number,
                    display_url: String,
                    thumbnail_src: String,
                  //   like_count: Number,
                    owner_id: Number
                   
              })

mongoose.connect( process.env.DB_HOST ,{useNewUrlParser:true})
// var db_ct = mongoose.model('matchakon', schema)
var db_ct = mongoose.model('aatest', schema)
// var db_ct = mongoose.model('matcha', schema)

module.exports = db_ct




// var Cat = require('db');

// var peter = new Cat();



