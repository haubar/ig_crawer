'use strict'

const axios = require('axios')
const fs = require('fs')
const db = require('./model/db')
const RequestError = require('./model/RequestError')
const Data = require('./model/Data')
const Location = require('./model/Location')
const urlParser = require('./urlParser')


// var client = redis.createClient()


//主資料filter - 多筆
let normalize = async function (arr) {
  let list = []
  for (let origin of arr) {
    let item = new Data(origin.node)
    list.push(item)
  }
  return list
}

//座標資料 filter
let locate = async function (data) {
    let item = new Location(data)
    return item
}

//多筆寫入
let writeDB = async function(result){
 await db.insertMany(result, {safe: true}).then(
        console.log(' add row - count: '+result.length)
      )
}

//更新DB資料
let updateDB = async function(data, shortcode){
  await db.findOneAndUpdate(
      { "shortcode": shortcode },
      { $set: data }
    ).then(
      console.log(' update data for shortcode - : '+ shortcode)
  ) 
}

let updatepageToken = async function(token){
  fs.writeFile('pagetoken.txt', token + "\n", function(err) {
      if(err) {
        console.log(err)
      } 
  })
}

let addtokenLog = async function(token){
  fs.appendFile('logtoken.txt', token + "\n", function(err) {
    if(err) {
      console.log(err)
    } 
  })
}

let addshortcodeLog = async function(code){
  fs.appendFile('logshortcode.txt', code + "\n", function(err) {
    if(err) {
      console.log(err)
    } 
  })
}

//有錯誤中斷時的備用讀取斷點
let regetData = async function(tag){
  await fs.readFile('pagetoken.txt', async function(err, data) {
    if(err) {
      throw new Error(err)
    } else {
      await console.log('get token in file ....'+ data.toString())
      await setTimeout(() => console.log(' To retry... for five second'), 5000)
      await setTimeout(() => nextPage(tag, data.toString()), 5000)
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
      var token = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
      var main_node = json.graphql.hashtag.edge_hashtag_to_media.edges
      var result = await normalize(main_node)
    }
      await writeDB(result)
      if (token != null) {
        await updatepageToken(token)
        await addtokenLog(token)
        await setTimeout(() => nextPage(tag, token), 5000)
      } else {
        console.log('Page End ..................................')
        throw new Error()
      }
  })
  .catch(async function (err) {
      await setTimeout(() => console.log(' To Reconnect !'), 6000);
      await regetData(tag)
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

//get tag data
exports.tag = async function (tag, callback) {
    await nextPage(tag, '')
}

//update place data
exports.place = async function (shortcode, callback) {
  let place = await digLocation(shortcode)
  await updateDB(place, shortcode)
}



