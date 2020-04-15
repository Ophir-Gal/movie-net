const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile)
const express = require('express');
const cors = require('cors');

var app = express();
app.use(cors()); // enable cors
app.use(express.static('.'))

app.get('/', function(req, res){
  readFile("data/network_data.json")
  .then(raw  => {
    var data = JSON.parse(raw);
    res.send(data)
  })
  .catch( e => { console.log(e) });
});

app.listen(8080, function() {
  console.log("A4 Data Server is running at localhost: 8080")
});
