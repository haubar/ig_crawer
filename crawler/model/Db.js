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
                    location_id: String,
                    location_name: String,
                    lat: String,
                    lng: String,
                    address: JSON,
                    //添加輔助資料
                    tag: String,
                    sort: Number,
                    enable: Boolean,
                    on_place: Boolean,
                    created_date: String
              })
//設定連線，設定mongoose的Deprecation Warnings
mongoose.connect( process.env.DB_HOST ,{useNewUrlParser:true, useFindAndModify: false, useCreateIndex: true})
// var db_ct = mongoose.model('match_devs_copys', schema)
var db_ct = mongoose.model(process.env.DB_DATABASE, schema)
// var db_ct = mongoose.model('aatest', schema)
// var db_ct = mongoose.model('matcha', schema)

module.exports = db_ct
