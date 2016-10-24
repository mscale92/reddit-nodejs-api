var express = require('express');
var app = express();

// load the mysql library
var mysql = require('mysql');


// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'mscale92', 
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit/promise_reddit')(connection);



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


//exercise 4

app.get('/posts', function(req, res){
    
    return reddit.getFive()
    .then(function(postsFive){
        return postsFive.map(function(post){
            
            return ('<li class = "content-item"> ' + '<h2 class="' + post.title + '"> '
            + '<a href="' + post.url + '">' + post.title + '</a> </h2> ' +
            '<p> Created by ' + post.username + '<p> </li> '
            )
        })
    })
    .then(function(htmlArray){
        console.log(htmlArray)
        var beginning = '<div id="contents"> <h1>List of contents</h1> <ul class="contents-list"> ';
        var end = '</ul> </div>'
        var string = beginning + htmlArray.join('') + end;
        return string;
    })
    .then(function(postsHTML){
        
        res.send(postsHTML);
    })
    
    
})

/* <div id="contents">
  <h1>List of contents</h1>
  <ul class="contents-list">
    <li class="content-item">
      <h2 class="content-item__title">
        <a href="http://the.post.url.value/">The content title</a>
      </h2>
      <p>Created by CONTENT AUTHOR USERNAME</p>
    </li>
    ... one <li> per content that your SQL query found
  </ul>
</div>*/


/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});