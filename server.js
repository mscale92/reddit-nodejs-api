var express = require('express');
var app = express();
var bodyParser = require('body-parser')
    //parse our form data

const pug = require('pug');
app.set('view engine', 'pug');
//template


app.use('/files', express.static('static_files'));
//static files, like imgs and css


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


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.get('/', function (req, res) {
  res.send('Welcome to the Homepage');
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
            //This allows for multiple choices with the same 
        //Or use
        // var rep = request.query.name || "World";
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
        //show the numbers in our object
    
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
        res.status(400).send("Please do a proper arithmetic operation")
    }
    
    res.send(req.params);
        //send the final object
})
    //if else chain to determine the type of mathmatical operation
    //if the input is not any of them, it returns a 400 error as a status
        //it also sends the user a little message


//exercise 4

app.get('/posts/', function(req, res, next){
        //We only get the latest five posts
        return reddit.getFive()
        .then(function(posts){
            console.log(posts);
            
            res.render('post-list', {posts: posts});
                //replaces the old code by doing all the html
                //templates in the pug file
            next();
            //don't end the connection between linked requests
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send("The Database is down, so sad");
            connection.end();
        })
})

app.get('/posts/:id', function(req, res, next){
    var id = parseInt(req.params.id);
        var options = {
        limit: 1,
        offset: 0
        }
        return reddit.getPost(options, id)
        .then(function(post){
            var posts = [post];
        res.render('post-list', {posts: posts});
        //rendering is nifty!
     
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send("The Database is down, so sad");
            connection.end();
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


//exercises 5 & 6

app.get(`/createContent`, function(req, res, next){
    res.render('create-content');
    next();
})
//give our user a form to fill out with get
    //using pug template
        //found in views folder under
        //create-content.pug


app.post(`/createContent`, function(req, res, next){
    
    var post = {
        url: req.body.url,
        title: req.body.title,
        userId: 1,
        subredditId: 6
    }
    
    return reddit.createPost(post)
    .then(function(results){
        
        var red = "/posts/" + results.id
        
        
        res.redirect(red);
        
    })
    
})
//retrieve the data from the form by having the same path
    //just a post instead of a get and some req.body middleware

//






/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("starting!", host, port);
});




//old code

    //  return postsFive.map(function(post){
            
    //         return ('<li class = "content-item"> ' + '<h2 class="' + post.title + '"> '
    //         + '<a href="' + post.url + '">' + post.title + '</a> </h2> ' +
    //         '<p> Created by ' + post.username + '<p> </li> '
    //         )
    //     })
    // })
    // .then(function(htmlArray){
    //     
    //     var beginning = '<div id="contents"> <h1>List of contents</h1> <ul class="contents-list"> ';
    //     var end = '</ul> </div>'
    //     var string = beginning + htmlArray.join('') + end;
    //     return string;
    // })
    // .then(function(postsHTML){
      