const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const express = require('express')
const cors = require('cors')
const readline = require('readline')
const TOTAL_NUM_OF_USERS = 610

var app = express()
app.use(cors()) // enable cors
app.use(express.static('.'))

var idToTitle = JSON.parse(fs.readFileSync("data/idToTitle.json"))

function findUndirectedEdge(links, target, source){
  for (let link of links){
    if ((link["target"] === target && link["source"] === source) ||
        (link["target"] === source && link["source"] === target)) {
          return link
        }
  }
  return false
}

function extractNodesAndLinks(ratingData,
                              selectedMovies=[1,318,6238,920],
                              username="User",
                              numUsersToProcess=10,
                              likeThreshold=0) {
  let nodes = []
  let links = []
  for (let i=0; i<=numUsersToProcess; i++){
    let userId = i === 0 ? username : i
    nodes.push({"id": userId})
    for (let d of ratingData){
      if (d["id"] === userId) {
        continue
      } else if(d["id"] <= numUsersToProcess
                && d["rating"] >= likeThreshold
                && selectedMovies.includes(d["movieId"])){
        let found = findUndirectedEdge(links, target=userId, source=d["id"])
        let movieTitle = idToTitle[String(d["movieId"])]["title"]
        if (found && (!found["movies"].includes(movieTitle))){
          found["movies"].push(movieTitle) 
        } else {
          links.push({"target":userId, "source":d["id"], "movies":[movieTitle]})
        }
      }
    }
    console.log('finished with user:', userId)
  }
  return {"nodes":nodes, "links":links}
}

app.get('/', function(req, res){
  readFile("data/ratings.json")
  .then(raw  => {
    let jsonTuples = JSON.parse(raw)
    let processedData = extractNodesAndLinks(jsonTuples)
    res.send(processedData)
    console.log(req)
  })
  .catch( e => { console.log(e) })
})

app.post

app.listen(8080, function() {
  console.log("A4 Data Server is running at localhost: 8080")
})
