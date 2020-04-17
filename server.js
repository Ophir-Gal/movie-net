const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const express = require('express')
const cors = require('cors')

var app = express()
app.use(cors()) // enable cors
app.use(express.static('.'))

var idToTitle = JSON.parse(fs.readFileSync("data/idToTitle.json"))
var titleToId = {}
for (let id in idToTitle) {
  titleToId[idToTitle[id].title] = Number(id)
}

app.get('/', function(req, res){
  readFile("data/ratings.json")
  .then(raw  => {
    let ratingData = JSON.parse(raw)
    res.send({"ratingData":ratingData,
              "idToTitleDict":idToTitle, 
              "titleToIdDict":titleToId})
  })
  .catch( e => { console.log(e) })
})

app.post

app.listen(8080, function() {
  console.log("A4 Data Server is running at localhost: 8080")
})
