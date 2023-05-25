require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const e = require('express');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const URLschema = {
  "original_url": {type: String, required: true},
  "shortened_url": {type: Number, required: true}
};

var url = mongoose.model('url', URLschema);
var index = 0;


app.use(bodyParser.urlencoded({ extended: true }));

// Basic Configuration
const port = process.env.PORT || 3000;


app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//Redirecting to the url
app.get("/api/shorturl/:shortend", (req,res) => {
  const shortend = parseInt(req.params.shortend);
  // console.log(shortend)
  url.findOne({shortened_url: shortend}, (err, data) => {
    if (err || data == null) return res.send("URL not found");
    // console.log(data)
    return res.redirect(data.original_url)
  });
});


url.countDocuments(function (err, count) {
  // console.log("count",count)
  if(count == "undefined" || count == 0){
    index = 0
  }
  else{
    index = count
  }
  

  app.post("/api/shorturl",  (req, res) => {
    const body = req.body.url; // url is name of the input field in HTML file
    
    if(!body.startsWith('http')){
      return res.json({"error": "invalid url"})
    }

    url.findOne({original_url: body}, (err, data) => {
      // console.log(data)
      if (err || (data == null)) {

        var inp_url = new url({original_url: body, shortened_url: index});
        index = index + 1;
        inp_url.save((err, data) => {
        if (err) return err;
        return res.json({original_url: body, shortened_url: data.shortened_url});
        // return console.log(data)
        });
      }
      
      else{
        return res.json({original_url: body, shortened_url: data.shortened_url});
      }
    });  
    
  });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
