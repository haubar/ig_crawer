'use strict'

const axios = require('axios')
const fs = require('fs')
const db = require('./model/db')
const dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/
const RequestError = require('./model/RequestError')
const Media = require('./model/Media')
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
    throw er
  }
  return json
}

var normalizeMedia = function (arr) {
  var list = []
  for (let origin of arr) {
    let item = new Data(origin.node)
      setTimeout(function() {
        db.find({shortcode:item.shortcode}, {_id: 0,shortcode: 1}, function (err, shortcode) {
          if (shortcode.length == 0) {
            var matcha = new db(item)
            matcha.save(function(err) {
              // console.log('data add')
              console.log('data add')
              // console.log(shortcode.length)
              if (err) {
                console.log('no add..')
              }
            })
            matcha = null
          } 
          // else {
          //   console.log('data exists...')
          // }
        }) 
      }, 8000)
    list.push(item)
  }
  
  return new Media(list)
}

//page end_cursor
var nextPage = null

var nextPage = function(tag, token, callback) {
  
  var url = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(urlParser.tag(tag)) + '?__a=1&max_id=' + token
  return axios.get(url)
  .then(function (res) {
    var json = res.data
    if(!!json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      
      fs.writeFile('pagetoken.txt', token + "\n", function(err) {
        if(err) {
           return console.log(err)
        }
        console.log(token)
      })
      var result = {
        media: normalizeMedia(json.graphql.hashtag.edge_hashtag_to_media.edges)
      }
      
      setTimeout(function() {
        // console.log('------------')
        nextPage(tag, token)
      }, 6000)
      // nextPage(tag, token)
      
    }
    
    // console.log(token)
  })
  .catch(function (err) {
    // new Function()
    fs.readFile('pagetoken.txt', function(err, data) {
      if(err) {
         throw err
      }
      setTimeout(function() {
        media: nextPage(tag, data.toString())
      }, 2000)
    })
    throw new Error(err)
    // callback(new RequestError(err))
  })
}


exports.tag = function (tag, callback) {
  var stoken = ''
  var url = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(urlParser.tag(tag)) + '?__a=1&max_id=' + stoken
  return axios.get(url)
  .then(function (res) {
    var json = res.data
    if(!!json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      var result = {
        media: nextPage(tag ,token)
      }
    }
    callback(null, result)
  })
  .catch(function (err) {
    // new Function()
    throw new Error(e)
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


