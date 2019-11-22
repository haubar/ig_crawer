const igcraw = require('./index')

var log = function () {
  // console.log(arguments)
}

//有執行指定參數時, 抓取tag，沒有時執行更新座標
if(process.argv[2]){
  let tag = process.argv[2] 
  igcraw.tag(tag)
} else {
  igcraw.place()
}


 


// igScrap.user('https://www.instagram.com/zuck/', log)
// var tag = igScrap.urlParser.tag('抹茶')
// var user = igScrap.urlParser.user('https://www.instagram.com/zuck/')

// console.log(tag)
