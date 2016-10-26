// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// var morgan = require('morgan');

var app = express();
  //set this anything, it is a variable for express


app.set('view engine', 'pug');
// Specify the usage of the Pug template engine 

app.use('/files', express.static('static_files'));
//static files, like imgs and css

app.use(cookieParser())
//cookie parser for our users to stay logged on


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
  var sorting = "";
  
  
  switch (req.query.sort){
    case "top":
      sorting = "top";
      break;
      
    case "hotness":
      sorting = "hot";
      break;
      
    case "newest":
      sorting = "newest";
      break;
      
    case "controversial":
      sorting = "contro";
      break;
    
    default:
      sorting = "hot";
  }
  
  console.log(sorting);
  //We only get the latest five posts
        return reddit.getAllPosts({numPerPage: 5, page: 0, sortingMethod: sorting})
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


//You are HERE!!!!!!!!!!!!

  //Login!
app.get('/login', function(req, res, next) {
  res.render('login');
  // next();
});

app.post('/login', function(req, res) {
  return reddit.checkLogin(req.body)
  .then(function(result){
    console.log("userId" ,result);
    
    if(result === "passDNE" || result === "userDNE"){
      res.redirect('/login/fail')
    }
    else{
      return reddit.createSession(result)
      .then(function(token){
        
        res.cookie('SESSION', token);
        //Session our token cookie from out createSession formula
        
        // console.log(token);
        
//HERE!!! YOU'RE HERE        
        return res.redirect("/");
        //redirect users to the homepage
      })
      .catch(function(err){
        res.status(500).send('an error occurred. please try again later!');
        console.log(err);
      });
      
    }
  })
  .catch(function(err){
    res.status(401).send(err.message);
    console.log(err);
  });
  // code to login a user
  // hint: you'll have to use response.cookie here
});
//retrieve login info

app.get('/login/fail', function(req, res, next){
  return res.render('fail');
});
//if the password is incorrect




  //Signup!
app.get('/signup', function(req, res, next) {
  res.render('signup');
  // next();
});
  //grab our html for the signup page, render it with pug and express

app.post('/signup', function(req, res) {
  
  
  return reddit.createUser(req.body)
  .then(function(freshUser){
    
    
    if(freshUser === "taken"){
      return res.redirect('/signup/try-again')
    }
    //if the name is taken, go to the signup taken page
    else{
      return res.redirect('/');
    }
    
  })
  .catch(function(err){
    console.log(err);
    connection.end();
  })
  // hint: you'll have to use bcrypt to hash the user's password
});

app.get('/signup/try-again', function(req, res, next){
  
  return res.render('userTaken');
})
  //if the signup fails, username already taken, try again!


  //Vote!
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