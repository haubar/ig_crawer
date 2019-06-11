require('dotenv').config()

var mongoose = require('mongoose')
var schema = mongoose.Schema({
                    //基本抓取資訊
                    id: Number,
                    shortcode: String,
                    timestamp: Number,
                    display_url: String,
                    thumbnail_src: String,
                    owner_id: Number,
                    location_name: String,
                    location_id: Number,
                    lat: String,
                    lng: String,
                    address: String,
                    //添加輔助資料
                    sort: Number,
                    enable: Boolean,
                    created_date: Date
              })

mongoose.connect( process.env.DB_HOST ,{useNewUrlParser:true})
var db_ct = mongoose.model('match_dev', schema)
// var db_ct = mongoose.model('matchakon', schema)
// var db_ct = mongoose.model('aatest', schema)
// var db_ct = mongoose.model('matcha', schema)

module.exports = db_ct


// var Cat = require('db');
// var peter = new Cat();



