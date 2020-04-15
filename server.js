const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile)
const express = require('express');
const cors = require('cors');

var app = express();
app.use(cors()); // enable cors
app.use(express.static('.'))

function extractNodesAndLinks(ratingData,
                              selectedMovies=[1,318,6238,920],
                              userIDs=["User",1,2,3,4,5],
                              likeThreshold=5) {
  var nodes = []
  var links = []
  for (let userId of userIDs){
    nodes.push({"id":userId})
    for (let d of ratingData){
      if (d["id"] !== userId &&
          selectedMovies.includes(d["movieId"]) &&
          d["rating"] >= likeThreshold){
        links.push({"target":userId,"source":d["id"], "movie":d["movieId"]})
      }
    }
  }

  return {"nodes":nodes, "links":links}
}

// TODO - process ratings_subset data to include actual movie titles
// TODO - handle case of 2 people liking the same multiple movies

app.get('/', function(req, res){
  readFile("data/ratings_subset.json")
  .then(raw  => {
    var jsonTuples = JSON.parse(raw)
    var processedData = extractNodesAndLinks(jsonTuples)
    res.send(processedData)
  })
  .catch( e => { console.log(e) });

  /*
  readFile("data/toy_network_data.json")
  .then(raw  => {
    var data = JSON.parse(raw);
    res.send(data)
  })
  .catch( e => { console.log(e) });
  */
});

app.listen(8080, function() {
  console.log("A4 Data Server is running at localhost: 8080")
});
