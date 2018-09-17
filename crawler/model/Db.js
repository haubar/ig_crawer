require('dotenv').config()

var mongoose = require('mongoose');
var schema = mongoose.schema({
                    id: Number,
                    shortcode: String,
                    dimensions_width: Number,
                    dimensions_height: Number,
                    display_url: String,
                    like_count: Number,
                    owner_id: Number,
                    thumbnail_src: String,
                    timestamp: Number
              });
var db_ct = mongoose.model('matcha', schema);
mongoose.connect( process.env.DB_HOST );

module.exports = db_ct




// var Cat = require('db');

// var peter = new Cat();



