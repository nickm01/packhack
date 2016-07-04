var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
app.get('/', function(req, res){ 
  res.send('Message from Nick'); 
});
app.listen(3000); 