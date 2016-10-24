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

var options = {
    numPerPage: 5,
    page: 0,
    sortingMethod: "contro"
};
//determines how man posts are shown per page, as well the sorting of votes
    //numPerPage is limit
    //page is offset
    

var myVote = {
    postId: 10,
    userId: 12,
    vote: -1,
};
//vote object used to vote on a post
    //both ids are necessary so that the program knows which post the
    //vote is on
    //vote is an integer of either 0, 1, or -1

var myComment = {
    text: "What's this? Brentalfloss songs?!",
    userId: 10,
    postId: 8,
    parentId: null
};
//object that creates a comment

var myPost = {
    title: "Panic! At the Disco",
    url: "https://www.reddit.com",
    userId: "",
    subredditId: "",
}
//object that determines a post's url, title, and the userId associated with it

var subName = {
    name: "Music",
    description: "Posts all about music"
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
    return reddit.getAllPostsforUser(options, userId)
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

function fetchSinglePost(postId, options){
    return reddit.getPost(options, postId)
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


function castOrChangeVote(vote){
    return reddit.createOrUpdateVote(vote)
    .then(function(results){
        console.log(results);
        connection.end();   
    })
    .catch(function(err){
        console.log(err);
        connection.end();
    })

}

function makeComment(comment){
    return reddit.createComment(comment)
    .then(function(results){
        console.log(results);
        connection.end();
    })
    .catch(function(err){
        console.log(err);
        connection.end();
    });
}

function showComments(postId){
    return reddit.getCommentsforPost(postId)
    .then(function(results){
        console.log(results);
        connection.end();
    })
    .catch(function(err){
        console.log(err);
        connection.end();
    });
}

showComments(8);

// makeComment(myComment);

// castOrChangeVote(myVote);

// showAllSubreddits(options);

// createSubs(subName);

// fetchSinglePost(10, options);

// showAllPosts(options);

// makeAPost(11, 5);

// makeAUserandPost("Beast", "yyy");