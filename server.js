var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});


//exercise 1
app.get('/hello', function(require, response){
   response.send('<h1>Hello World!</h1>'); 
});
    //if the url, http://reddit-nodejs-mscale92.c9users.io/,
    //has a hello added to the path, Hello World will print
    //as an h1 string in html







/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});