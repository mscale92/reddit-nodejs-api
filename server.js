var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});


//exercise 1
app.get('/hello', function(request, response, next){
    console.log(request.query);
    var rep = request.query.name ? request.query.name : "World";
            //exercise 2
            //a ternary operator allows the choice of one
            //query or the other
                //if request.query.name exists, then use the query
                //otherwise, use World
            //This allows for multiple choices with the same function
   response.send('<h1>Hello '+ rep +' !</h1>'); 
                            
   
});









/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});