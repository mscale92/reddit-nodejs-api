// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
// var morgan = require('morgan');

var app = express();
  //set this anything, it is a variable for express

// Specify the usage of the Pug template engine
app.set('view engine', 'pug');

app.use('/files', express.static('static_files'));
//static files, like imgs and css



// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
app.use(bodyParser.urlencoded({extended: false}));

// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
// app.use(cookieParser());
    //LATER COOKIEPARSER
// This middleware will console.log every request to your web server! Read the docs for more info!
// app.use(morgan('dev'));
    //LATER MORGAN
    
//MySQL Database connections

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


//End of express middleware and mods

// Resources

//HERE!!!!!!!!!!!!!!
app.get('/', function(req, res) {
  /*
  Your job here will be to use the RedditAPI.getAllPosts function to grab the real list of posts.
  For now, we are simulating this with a fake array of posts!
  */
  
  //We only get the latest five posts
        return reddit.getFive()
        .then(function(posts){
            console.log(posts);
            
            res.render('post-list', {posts: posts});
                //replaces the old code by doing all the html
                //templates in the pug file
            
            //don't end the connection between linked requests
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send("The Database is down, so sad");
            connection.end();
        })

  /*
  Response.render will call the Pug module to render your final HTML.
  Check the file views/post-list.pug as well as the README.md to find out more!
  */
  
});
//You are here, don't do posts today! Wait for more info on that tomorrow



app.get('/login', function(request, response) {
  // code to display login form
});

app.post('/login', function(request, response) {
  // code to login a user
  // hint: you'll have to use response.cookie here
});

app.get('/signup', function(request, response) {
  // code to display signup form
});

app.post('/signup', function(request, response) {
  // code to signup a user
  // ihnt: you'll have to use bcrypt to hash the user's password
});

app.post('/vote', function(request, response) {
  // code to add an up or down vote for a content+user combination
});


// Listen
var port = process.env.PORT || 3000;
app.listen(port, function() {
  // This part will only work with Cloud9, and is meant to help you find the URL of your web server :)
  if (process.env.C9_HOSTNAME) {
    console.log('Web server is listening on https://' + process.env.C9_HOSTNAME);
  }
  else {
    console.log('Web server is listening on http://localhost:' + port);
  }
});