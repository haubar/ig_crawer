'use strict'

const axios = require('axios')
const fs = require('fs')
const moment = require('moment')
const db = require('./model/db')
// const dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/
const RequestError = require('./model/RequestError')
const User = require('./model/User')
const Data = require('./model/Data')
const Location = require('./model/Location')
const urlParser = require('./urlParser')

// const Image = require('./model/Image')
// const Media = require('./model/Media')

// var client = redis.createClient()
var token = null

// var parse = function (string) {
//   var json = null
//   try {
//     var dataString = string.match(dataExp)[1]
//     json = JSON.parse(dataString)
//   } catch (err) {
//     throw err
//   }
//   return json
// }

//主要的資料存取
let normalize = async function (arr) {
  var list = []
  for (let origin of arr) {
    let item = new Data(origin.node)
    // console.log(item)
    // console.log(Object.keys(item).length)
    await db.find({shortcode:item.shortcode}, {_id: 0,shortcode: 1})
      .then(
        shortcode => {
          if (Object.keys(shortcode).length <= 0) {
            console.log(' No Find Data, Add '+item.shortcode)
            let location = digLocation(item.shortcode)
            item.push(location)
            list.push(item)
            // var matcha = new db(item)
            // matcha.save().then(
            //   console.log('DB add row - count: '+item.shortcode),
            //   // nextPage(tag, token)
            // )
          } else {
            //double check
            if (Object.keys(shortcode).length > 1) {
              console.info('repeat data: ',shortcode)
              fs.appendFile('repeat_shortcode.txt', shortcode + "\n", function(err) {})
            }
            // console.log('Find Data : '+Object.keys(shortcode).length)
          }
        }
      )
    
    // list.push(item)
    // console.log(item.shortcode)
    // console.log(list.length)
  }
  return list
}

let writeDB = async function(result){
  // console.log(result)
  db.insertMany(result, {safe: true}).then(
        console.log(' add row - count: '+result.length),
        // nextPage(tag, token)
      )
}

let writeFS = async function(token){
  fs.writeFile('pagetoken.txt', token + "\n", function(err) {
      if(err) {
        console.log(err)
      } else {
        // console.log(token)
      }
  })
  fs.appendFile('logtoken.txt', token + "\n", function(err) {
    if(err) {
      console.log(err)
    } else {
      // console.log(token)
    }
  })
}

//有錯誤中斷時的備用讀取斷點
let readFS = async function(tag){
  fs.readFile('pagetoken.txt', function(err, data) {
    if(err) {
      throw new Error(err)
    } else {
      console.log('get token in file ....'+ data.toString())
      setTimeout(function() {
        nextPage(tag, data.toString())
      }, 5000)
      
    }
  })
}

//page end_cursor
let nextPage = async function(tag, token, callback) {
  let url = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(urlParser.tag(tag)) + '?__a=1&max_id=' + token
  return await axios.get(url)
  .then(async function (res) {
    var json = res.data
    if(json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page != false){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      var result = await normalize(json.graphql.hashtag.edge_hashtag_to_media.edges)
    }
      await writeDB(result)
      if (token != null) {
        await writeFS(token)
        // setTimeout(function() {
        //   console.log('next craw...')
        //   nextPage(tag, token)
        // }, 6000)
      } else {
        console.log('Page End ..................................')
        throw new Error()
      }
      

  })
  .catch(async function (err) {
    // new Function()  
      console.log(' To Reconnect !')
      await readFS(tag)
  
    // setTimeout(function(data) {
    //   nextPage(tag, data.toString())
    // }, 5000)
    throw new Error(err)
  })
}


let digLocation = async function(shortcode, callback) {
  let url = 'https://www.instagram.com/p/' + shortcode + '?__a=1'
  return await axios.get(url)
  .then(async function (res) {
      let json = res.data
      if(!!json.graphql.shortcode_media.location.id != false) {
          let location_id = json.graphql.shortcode_media.location.id
          console.info('location id: ',location_id)
          let result_location = await digCoordinate(location_id)
      }
  })
}

let digCoordinate = async function(location, callback) {
  let url = 'https://www.instagram.com/explore/locations/' + location + '?__a=1&max_id=' + token
  return await axios.get(url)
  .then(async function (res) {
      let json = res.data
      // console.log(res.data)
      if(!!json.graphql.location.id) {
        for (let origin of json.graphql) {
          let item = new Location(origin.node)
        }
      }
  })
}

//改為時間斷點，減少end_cursor與token改變時，會有重覆資料的狀況
// moment(1541411221345).format('YYYY-MM-DD')

exports.tag = async function (tag, callback) {
  let stoken = ''
  let url = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(urlParser.tag(tag)) + '?__a=1&max_id=' + stoken
  return await axios.get(url)
  .then(async function (res) {
    let json = res.data
    let result = await normalize(json.graphql.hashtag.edge_hashtag_to_media.edges)
    await writeDB(result)
    if(!!json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      
      await nextPage(tag ,token)
    } else {
      console.log('Page End ..................................')
      throw new Error()
    }
  })
  .catch(function (err) {
    // new Function()
    throw new Error(err)
    // callback(new RequestError(err))
  })
}





