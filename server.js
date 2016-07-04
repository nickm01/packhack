var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));
app.get('/', function(req, res){ 
  res.send('Message from Nick'); 
});
app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});