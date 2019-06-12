'use strict'

const axios = require('axios')
const fs = require('fs')
const db = require('./model/db')
const RequestError = require('./model/RequestError')
const User = require('./model/User')
const Data = require('./model/Data')
const Location = require('./model/Location')
const urlParser = require('./urlParser')


// var client = redis.createClient()
var token = null

//清空log
fs.writeFile('logtoken.txt', "\n", function(err) {
  if(err) {
    console.log(err)
  }
})

//主要的資料存取
let normalize = async function (arr) {
  let list = []
  for (let origin of arr) {
    let item = new Data(origin.node)
    await console.log(' No Find Data, Add '+item.shortcode)
    // let local = await digLocation(item.shortcode)
    // let newItem = Object.assign(item, local);
    // list.push(newItem)
    list.push(item)
  }
  return list
}

//location filter
let locate = async function (data) {
    let item = new Location(data)
    return item
}

//多筆寫入
let writeDB = async function(result){
  // console.log(result)
 await db.insertMany(result, {safe: true}).then(
        console.log(' add row - count: '+result.length)
        // nextPage(tag, token)
      )
}

let updateDB = async function(result, shortcode){
  await db.updateOne(
      { "shortcode": shortcode },
      { $set: result },
      { upsert: true}
    ).then(
      console.log(' update row - count: '+result.length)
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
  return await axios.get(url,{timeout: 5000})
  .then(async function (res) {
    let json = res.data
    if(json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page != false){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      var result = await normalize(json.graphql.hashtag.edge_hashtag_to_media.edges)
    }
      await writeDB(result)
      if (token != null) {
        await writeFS(token)
        await setTimeout(() => console.info('下一頁存在...', token), 5000);
        nextPage(tag, token)
      } else {
        console.log('Page End ..................................')
        throw new Error()
      }
  })
  .catch(async function (err) {
      console.log(' To Reconnect !')
      await readFS(tag)

    // setTimeout(() => console.log('Loaded'), 2000);

    throw new Error(err)
  })
}

let digLocation = async function(shortcode, callback) {
  let url = 'https://www.instagram.com/p/' + shortcode + '?__a=1'
  return await axios.get(url,{timeout: 5000})
  .then(async function (res) {
      let json = res.data
      if(json.graphql.shortcode_media.location) {
          let location_id = json.graphql.shortcode_media.location.id
          await console.info('位置id ', location_id)
          let data = await digCoordinate(location_id)
          return data
      } else {
          await console.log('沒有Location ID')
      }
  })
}

let digCoordinate = async function(location, callback) {
  let url = 'https://www.instagram.com/explore/locations/' + location + '?__a=1'
  return await axios.get(url,{timeout: 5000})
  .then(async function (res) {
      let json = res.data
      await console.info('位置名稱',json.graphql.location.name)
      let data = await locate(json.graphql.location)
      return data
  })
}


exports.tag = async function (tag, callback) {
  let stoken = ''
  let url = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(urlParser.tag(tag)) + '?__a=1&max_id=' + stoken
  return await axios.get(url,{timeout: 5000})
  .then(async function (res) {
    let json = res.data
    let result = await normalize(json.graphql.hashtag.edge_hashtag_to_media.edges)
    // await console.log(result)
    await writeDB(result)
    if(!!json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page){
      token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      
      await setTimeout(() => console.info('下一頁存在...', token), 3000);
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





