require('dotenv').config()

var mongoose = require('mongoose')
var schema = mongoose.Schema({
                    //基本抓取資訊
                    id: String,
                    shortcode: String,
                    timestamp: String,
                    display_url: String,
                    thumbnail_src: String,
                    owner_id: String,
                    location_name: String,
                    location_id: String,
                    lat: String,
                    lng: String,
                    address: JSON,
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



