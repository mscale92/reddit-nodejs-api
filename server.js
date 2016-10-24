var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});


//exercise 1
app.get('/hello', function(request, response){
    console.log(request.query);
    //shows the query that was entered 
    var rep = request.query.name ? request.query.name : "World";
            //exercise 2
            //a ternary operator allows the choice of one
            //query or the other
                //if request.query.name exists, then use the query
                //otherwise, use World
            //This allows for multiple choices with the same function
   response.send('<h1>Hello '+ rep +' !</h1>'); 
                            
   
});


//exercise 2.5
app.get('/flights/:from-:to', function(request, response){
   console.log(request.params);
  //shows the parameter object that was entered
   response.send(request.params);
   
});


//exercise 3
app.get('/calculator/:operator', function(req, res){
    console.log(req.params);
    var op = req.params.operator;
    
    var num1 = parseFloat(req.query.num1);
    var num2 = parseFloat(req.query.num2);
            //make our strings into floating numbers, decimals
    req.params.firstNum = num1;
    req.params.secondNum = num2;
    
    if(op === "add"){
        req.params.ans = num1 + num2;
    }
    else if(op === "sub"){
        req.params.ans = num1 - num2;
    }
    else if(op === "mult"){
        req.params.ans = num1 * num2;
    }
    else if(op === "div"){
        req.params.ans = num1 / num2;
    }
    else{
        res.sendStatus(405);
    }
    
    res.send(req.params);
        //send the final object
})
    //if else chain to determine the type of mathmatical operation
    //if the input is not any of them, it returns a 405 error,
        //Method not Allowed



/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});