// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');
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



function checkLoginToken(req, res, next){
  if(req.cookies.SESSION){
    return reddit.getUserFromSession(req.cookies.SESSION)
    .then(function(result){
      // console.log(result, "pink");
      if(result !== false){
        // console.log('red', result);
        req.loggedInUser = result[0];
          //result is an array
        next();
      }
      else{
        next();
      }
    })
  }
  else{
    next();
  }
}
//This takes the token, if it's there, from the cookie object
  //given to the user, found in req.cookie under the key SESSION

app.use(checkLoginToken);
  //use the checkLoginToken to see if the user is logged in
    //this runs the function every time we have a request
    //it sets the req.loggedInUser, a homemade object, to the
      //result, if it is present
    //otherwise, next!


//End of express middleware and mods

// Resources


app.get('/', function(req, res) {
  var sorting = "";
  // console.log(req.query);
  
  switch (req.query.sort){
    case "top":
      sorting = "top";
      break;
      
    case "hotness":
      sorting = "hotness";
      break;
      
    case "newest":
      sorting = "newest";
      break;
      
    case "controversial" || "controversial?":
      sorting = "controversial";
      break;
    
    default:
      sorting = "hot";
  }
  
  
  console.log(req.query.sort, " is the category!")

  var offset = 0;
  var limit = 5;
  //We only get the latest five posts
  
  if(req.query.page){
    offset = parseInt(req.query.page);
  }
    //queries are fussy, no strings for ints
  
    return reddit.getAllPosts({numPerPage: limit, page: offset, sortingMethod: sorting})
    .then(function(posts){
        // var category = req.query.sort; 
        
        var sort = [{sort: sorting}];
        var prev = [{page: offset-1}];
        var next = [{page: offset+1}];
        var title = [{name: 'Page ' + offset}];
        var head = title;
        
        if(offset === 0){
          //give it the value of negative one
            // this value is used to hide the button via jquery file
              // spec, function hide page buttons
          prev = [{page: -1}];
          title = [{name: 'Homepage'}];
          head = [{name: 'Welcome to the Homepage!'}];
        }
          //give it the value of negative one too
        else if(posts.length < limit){
          next = [{page: -1}];
        }

          
          
          var user = null;
          
        // give current logged in user's id info
          // so that the votes will be properly recorded
        if (!req.loggedInUser) {
          // if no one is logged in, just pass the id as zero
            //no one has an id of zero
            //and they will be denied at the /vote endpoint
              //without a cookie
          user = [{id: 0}];
        }
        
        else{
          // make an array with the object houseing the userId
            // of the currently logged in user
          var obj = req.loggedInUser;
          user = [{id: obj.userId}];
          console.log(user, "current user's id");
        }
        
       
        
        res.render('homepage', {posts: posts,
        next: next,
        prev: prev,
        title: title,
        head: head,
        sort: sort,
        user: user
        });
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
  Check the file views/homepage.pug as well as the README.md to find out more!
  */
  
});


  //Get single post!

app.get('/post', function(req, res){
  var postId = req.query.post;
  
  var options = {};
  
  return reddit.getPost(postId)
  .then(function(result){
    
    var post = result;
    return reddit.getComments(postId)
    .then(function(parent){
      
      
      var reply1= [];
      parent.filter(function(rep){
        if(rep.replies.length > 0){
          
          reply1 = rep.replies.map(function(rep){
            return rep;
          })
        }
      })
      
      
      
     
      
      var reply2 = [];
      
      reply1.filter(function(reply){
        if(reply.replies.length > 0){
          reply2 = reply.replies.map(function(rep){
            return rep;
          })
        }
      })
      
      
      
      res.render("post", {post: post,
      parent: parent,
      reply1: reply1,
      reply2: reply2
      })
    })
    .catch(function(err){
      console.log(err);
        res.status(500).send("The Database is down, so sad");
        connection.end();
    })
  })
})


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
        
        
        //This assigns the string SESSION to our token value
          //The cookie function in express sends the cookie
          //to the user
            //in order to check to see if the cookie is there
            //use req.cookie, just like req.params
        
        // console.log(token);
        
        
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
      return reddit.createSession(freshUser.id)
      .then(function(token){
      //after creating a user, have them log in!
        res.cookie('SESSION', token);
        //This assigns the string SESSION to our token value
          //The cookie function in express sends the cookie
          //to the user
            //in order to check to see if the cookie is there
            //user req.cookie, just like req.params
        
        // console.log(token);
        
        
        return res.redirect("/");
        //redirect users to the homepage
      })
      .catch(function(err){
        res.status(500).send('an error occurred. please try again later!');
        console.log(err);
      });
      // return res.redirect('/');
    }
    
  })
  .catch(function(err){
    console.log(err);
    connection.end();
  })
  // hint: you'll have to use bcrypt to hash the user's password
});

app.get('/signup/try-again', function(req, res){
  
  return res.render('userTaken');
})
  //if the signup fails, username already taken, try again!




app.get('/createPost', function(req, res){
  res.render('createPost');
})


// Create a Post
app.post('/createPost', function(req, res) {
  // before creating content, check if the user is logged in
  console.log(req.loggedInUser)
  
  
  if (!req.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    res.status(401).render("denied");
    // res.render("denied");
  }
  else {
    var user = req.loggedInUser;
      //make our object look pretty
    
    
      //let's replace all /r and /n's with a <br />
        // This way our pug can properly render all returns
        //and new lines as html line breaks <br />
    var content = req.body.content.replace(/\n?\r\n/g, '<br />' );
    
    
    // here we have a logged in user, let's create the post with the user!
    return reddit.createPost({
      title: req.body.title,
      url: req.body.url,
      userId: user.userId,
      sub: req.body.sub,
      content: content
    })
    .then(function(result){
      console.log(result);
      res.redirect("/post/success");
    })
    .catch(function(err){
      res.status(500).send('an error occurred. please try again later!');
      console.log(err);
    });
  }
});

app.get("/post/success", function(req, res){
  res.render("postSuccess");
});



app.get("/logout", function(req, res){
  console.log(req.body);
  return reddit.logout(req.cookies.SESSION)
  .then(function(result){
    res.clearCookie('SESSION');
    res.render('logout')
  })
  .catch(function(err){
    res.status(500).send('an error occurred. please try again later!');
    console.log(err);
  });
  
})
//Log the users out, clears the cookies so that new users can log in
  //and the old users can safely close their session





  //Vote!
app.post('/vote', function(req, res) {
  // code to add an up or down vote for a content+user combination
  if (!req.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    res.status(401).render("denied");
    
  }
  else {
    console.log(req.body);
    
    return reddit.createOrUpdateVote(req.body)
    .then(function(result){
      console.log("vote successful");
        // our vote was successful!
          // Make a JSON saying so :D
      return reddit.getPost(req.body.postId)
      .then(function(result){
        console.log(result, "lions");
       
        result = result[0];
        var obj = {"success": true, "voteScore": result.voteScore, "up": result.up, "down": result.down};
       
        res.json(obj);
        
      }); 
      
    })
    .catch(function(err){
      res.status(500).send('an error occurred. please try again later!');
      console.log(err);
  });
    
      
  }
});


// Url Suggest!

app.get('/suggestTitle', function(req, res) {
    console.log(req.query.url)
    return getPromise(req.query.url)
    .then(function(result){
      
      
      var title = result.body.split("</title>")
      title = title[0].split("<title");
      title = title[1].split(">");
      
      

    res.send(title[1]);
    })
    .catch(function(err){
      console.log(err);
    })
});


// Subreddit Autocomplete!
app.get('/suggest', function(req, res) {
    var suggestion = req.query.query;
    console.log(suggestion, "this is the suggestion");
    
    return reddit.getSubSuggest(suggestion)
    .then(function(results){
      
      console.log(results)
      var subSuggest = results.map(function(sub){
        return {"value": sub.name, "data": sub.id}
      })
      
      res.json({"query": "Unit",
    "suggestions": subSuggest})
    
    })
    
    
});


// our old getPromise function, tried and true
  // uses a url to request!
function getPromise(url){
    return(
        new Promise(function(resolve, reject){
            request(url, function(err, result){
                if(err){
                    reject(err);
                }
                else{
                    resolve(result);
                }
            });
        })
    );
}











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