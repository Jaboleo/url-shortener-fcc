
'use strict'
// init project
var express = require('express');
var app = express();
var mongodb = require("mongodb").MongoClient;
let mongoose = require("mongoose")
let validator = require("validator")
var bodyParser = require('body-parser')
mongoose.connect(process.env.DB_KEY)

// create application/json parser
var jsonParser = bodyParser.json() 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


//initiate database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log("Database opened")
  let dbSchema = mongoose.Schema({
    original_url: String,
    short_url: Number
  })

  let shortUrls = mongoose.model("shortUrls", dbSchema)
  //redirect to a website if exists in database
  app.get('/api/shorturl/:short', (req, res) => {
    shortUrls.find({
      'short_url': req.params.short
    }, (err,docs) => {
      //if(err) throw err 
      console.log(docs[0])
      if(docs.length) res.redirect(docs[0].original_url)
      else res.send("No such URL in database")
       }) 
  });

  //STEP 1 - POST URL 
  app.post("/api/shorturl/new",urlencodedParser, (req, res) => {
    console.log(typeof req.body.url)
    //STEP 2 -VALIDATE URL
    if (validator.isURL(req.body.url)) {
      console.log("validURL")
      let count = shortUrls.count({}, (err, c) => {
        console.log(c)
        //STEP 3 - FIND IF URL ALREADY EXISTS  
        shortUrls.find({
          'original_url': req.body.url
        }, function (err, docs) {
          if (docs.length) res.send({'original_url':docs[0].original_url, 'short_url':docs[0].short_url})
          else {              
            let newURL = new shortUrls({
              original_url: req.body.url,
              short_url: c
            })
            newURL.save()
            res.send({'original_url':newURL.original_url, 'short_url':newURL.short_url})
          }

        });

      })

    } else {
      console.log('invalid URL')
      res.send({
        "aaa": "bbbb"
      })
    }


  });
});


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});