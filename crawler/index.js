'use strict'

const axios = require('axios')
const fs = require('fs')
const db = require('./model/db')
const dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/
const RequestError = require('./model/RequestError')
// const Media = require('./model/Media')
const User = require('./model/User')
// const Image = require('./model/Image')
const Data = require('./model/Data')
const urlParser = require('./urlParser')

// var client = redis.createClient()
var token = null

var parse = function (string) {
  var json = null
  try {
    var dataString = string.match(dataExp)[1]
    json = JSON.parse(dataString)
  } catch (err) {
    throw err
  }
  return json
}


var normalize = async function (arr) {
  var list = []
  for (let origin of arr) {
    let item = new Data(origin.node)
    // console.log(item)
    // console.log(Object.keys(item).length)
    await db.find({shortcode:item.shortcode}, {_id: 0,shortcode: 1})
      .then(
        shortcode => {
          if (Object.keys(shortcode).length <= 0) {
            list.push(item)
            console.log(' No Find Data, Add '+item.shortcode)
          } else {
            // console.log(shortcode)
            console.log('Find Data : '+Object.keys(shortcode).length)
          }
        }
      )
    
    // list.push(item)
    // console.log(item.shortcode)
    console.log(list.length)
  }
  return list
}

let writeDB = async function(result){
  // console.log(result)
  db.insertMany(result).then(
        console.log(' add row - count: '+result.length),
        // nextPage(tag, token)
      )
}
let writeFS = async function(token){
  fs.writeFile('pagetoken.txt', token + "\n", function(err) {
      if(err) {
        console.log(err)
      } else {
        console.log(token)
      }
  })
}

//page end_cursor
var nextPage = async function(tag, token, callback) {
  
  var url = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(urlParser.tag(tag)) + '?__a=1&max_id=' + token
  return await axios.get(url)
  .then(async function (res) {
    var json = res.data
    if(!!json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      var result = await normalize(json.graphql.hashtag.edge_hashtag_to_media.edges)
    }
      await writeDB(result)
      await writeFS(token)
      await nextPage(tag, token)

  })
  .catch(function (err) {
    // new Function()
    fs.readFile('pagetoken.txt', function(err, data) {
      if(err) {
         throw err
      } else {
        setTimeout(function() {
          nextPage(tag, data.toString())
        }, 2000)
      }
    })
    throw new Error(err)
    // callback(new RequestError(err))
  })
}


exports.tag = async function (tag, callback) {
  var stoken = ''
  var url = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(urlParser.tag(tag)) + '?__a=1&max_id=' + stoken
  return await axios.get(url)
  .then(function (res) {
    var json = res.data
    if(!!json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      let result = nextPage(tag ,token)
    }
  })
  .catch(function (err) {
    // new Function()
    throw new Error(err)
    // callback(new RequestError(err))
  })
}

// exports.user = function (user, callback) {
//   var url = 'https://www.instagram.com/' + urlParser.user(user)
//   return axios.get(url)
//   .then(function (res) 
//     var json = parse(res.data)
//     var result = {
//       user: new User(json.entry_data.ProfilePage[0].graphql.user),
//       media: normalizeMedia(json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges)
//     }

//     callback(null, result)
//   })
//   .catch(function (err) {
//     callback(new RequestError(err))
//   })
// }


