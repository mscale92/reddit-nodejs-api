//trying to get posts with a promise function from promise_reddit;

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
var reddit = require('./promise_reddit')(connection);

var postPerPage = {
    numPerPage: 10,
    page: 0
}



var myPost = {
    title: "HELLO!!",
    url: "https://www.reddit.com",
    userId: "",
    subredditId: "",
}
//object that determines a post's url, title, and the userId associated with it

var subName = {
    name: "Hey!",
    description: "blue"
}
//determines the name and description of a subreddit


//functions ahoy!

function makeAUserandPost(username, pass){
    reddit.createUser({
        username: username,
        password: pass
    })
    .then(function(user){
        myPost.userId = user.id
        return reddit.createPost(myPost);
    })
    .then(function(result){
        console.log(result);
        //show my id and post information!
        connection.end();
    })
    .catch(function(err){
        console.log(err, "there was an error");
        connection.end();
        
    });
}

function makeAPost(userId, subredditId){
    myPost.userId = userId;
    myPost.subredditId = subredditId;
    return reddit.createPost(myPost)
    .then(function(postResults){
        console.log(postResults);
        connection.end();
    })
    .catch(function(err){
        console.log(err);
        connection.end();
    })
}
//make a Post
    //takes a userId as a parameter
    //so that the created posts are associated
    //with the correct user
    
    
    
function showAllSubreddits(postPerPage){
    return reddit.getAllSubreddits(postPerPage)
    .then(function(subreddits){
        console.log(subreddits);
        connection.end();
    })
    .catch(function(error){
        console.log(error);
        connection.end();
    })
}
//end



function showAllPosts(postsOptions){
    return reddit.getAllPosts(postsOptions)
    .then(function(result){
        console.log(result);
         connection.end();
    })
    //  connection.end();
    .catch(function(err){
        console.log(err);
        connection.end();
    })
}
//show all posts function

function fetchUserPosts(userId){
    return reddit.getAllPostsforUser(postPerPage, userId)
    .then(function(userPosts){
        // console.log(userPosts);
        return userPosts.map(function(post, idx){
            if(idx === 0){
               return {username: post.username, userId: post.userId,
               id: post.id, title: post.title, url: post.url, 
               createdAt: post.createdAt, updatedAt: post.updatedAt}
            }
            else{
                return {id: post.id, title: post.title, url: post.url, 
               createdAt: post.createdAt, updatedAt: post.updatedAt}
            }
        })
    })
    .then(function(results){
        console.log(results);
        connection.end()
    })
    .catch(function(err){
        console.log(err);
        connection.end();
    });
}
//end of fetchUserPosts
    //grabs all the posts that a user has posted
    //just needs the userId number as a parameter

function fetchSinglePost(postId){
    return reddit.getPost(postPerPage, postId)
    .then(function(result){
        console.log(result);
        connection.end();
    })
    .catch(function(error){
        console.log(error);
        connection.end();
    })
}


function createSubs(sub){
    return reddit.createSubreddit(sub)
    .then(function(subReds){
        console.log(subReds);
        connection.end();
    })
    .catch(function(err){
        console.log(err, "red");
        connection.end();
    })
}

// showAllSubreddits(postPerPage);

// createSubs(subName);

// fetchSinglePost(3);

showAllPosts(postPerPage);

// makeAPost(10, 1);

// makeAUserandPost("Beast", "yyy");