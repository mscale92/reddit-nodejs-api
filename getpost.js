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
    title: "This is my second post",
    url: 'https://www.reddit.com',
    userId: 10
}

var firstPost = {
    title: "Mew",
    url: "https://www.reddit.com",
    userId: ""
}

function makeAUserandPost(username, pass){
    reddit.createUser({
        username: username,
        password: pass
    })
    .then(function(user){
        firstPost.userId = user.id
        return reddit.createPost(firstPost);
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

function makeAPost(){
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


function showAllPosts(){
    return reddit.getAllPosts(postPerPage)
    .then(function(allPosts){
        // console.log(allPosts);
        //
       return allPosts.map(function(post){
        post.user = {
            id: post.user, 
            username: post.Username, 
            createdAt: post.uCreatedAt, 
            updatedAt: post.uUpdatedAt
        }
            //add all of our information to our object
        delete post.Username;
        delete post.uCreatedAt;
        delete post.uUpdatedAt;
            //delete the extra information
        return post;   
       })
    })
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

function fetchUserPosts(userId){
    return reddit.getAllPostsforUsers(postPerPage, userId)
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

fetchUserPosts(10);

// showAllPosts();

// makeAPost();

// makeAUserandPost("Beast", "yyy");