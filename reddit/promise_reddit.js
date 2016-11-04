var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
//bcrypt mod

var secureRandom = require('secure-random');
// this function creates a big random string

function queryPromise(query, columns, connect){
  return(
       new Promise(function(resolve, reject){
          //make sure that resolve and reject are in the RIGHT ORDER!
          connect.query(query, columns, function(err, result) {
            if(err){
              reject(err);
            }
            else{
              var string = JSON.stringify(result, null, 4);
              resolve(JSON.parse(string));
            }
          })
        })
  )      
    
}

function comparePassProm(pass, actualHashedPassword){
  return(
    new Promise(function(resolve, reject){
      bcrypt.compare(pass, actualHashedPassword, function(err, result){
        if(result === true){
          resolve(result);
        }
        else{
          console.log(err);
          reject("passDNE");
        }
      })
    })
  )
}


function createSessionToken(){
  return (
      secureRandom.randomArray(100).map(function(code){
        return code.toString(36);
      }).join('')
      );
}
    //makes a random string that we use as a cookie token


//comments global variables
var currentLevel = 0; 
var parents = [];
var postsMap = {};
var topLevelPosts = [];


//exported object
function getPromise(connect){

  return {
    
    logout: function(token){
      return queryPromise('delete from sessions where token=?', [token], connect)
      .then(function(result){
        console.log("cookies deleted!", result);
        return result;
      })
    },
    
    getUserFromSession: function(token){
      return queryPromise('select * from sessions where token = ?'
      ,[token] ,connect)
      .then(function(result){
        
        
        if(result.length === 0){
          return false;
        }
        else{
          return result;
        }
      })
      .catch(function(err){
        console.log(err, "token not there");
      })
    },
    //takes the login token and checks to see if the user is logged in

    createSession: function(userId){
      var token = createSessionToken();
      return queryPromise('INSERT INTO sessions SET userId = ?, token = ?'
      ,[userId, token] ,connect)
      .then(function(results){
        console.log("token inserted successfully" ,results);
        return token;
        //since token is a variable in the scope of our
          //createSession function we can access it here
      })
      .catch(function(err){
        console.log(err);
      });
    },
    
    
    checkLogin: function(usernameAndPass){
      return queryPromise('select * from users where username = ?;' 
      ,[usernameAndPass.username], connect)
      .then(function(result){
        if(result.length === 0){
          return "userDNE";
          //if the length is zero then it does not exist
        }
        else{
          var user = result[0];
          //grab our user object from our array, it's the only value
         
            //compare the hashedPassword stored in our database
            //with the password
            
            return comparePassProm(usernameAndPass.password, user.password)
            .then(function(result){
              //results will be a boolean, true
                //if it is false, it will sent to the catch
                //and be undefined
              if(result === true){
                return user.id
                //we need the user.id for cookies, so we return it here
                //as our value
              }
              else{
                new Error('uh oh, something went wrong')
              }
            })
            //use our compare password promise to see if the entered password
              //and the saved hashed password are the same.
        }
      })
      .then(function(results){
        //our results should be our userId
        
        
          return results;
        
      })
      .catch(function(err){
        if(err === "passDNE"){
          console.log("Incorrect Password");
          return err;
        }
        else{
          console.log(err);
        }
      });
    },
    
    createUser: function(user){
      return(
        new Promise(function(resolve, reject){
          bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword){
            if(err){
              reject(err);
            }
            else{
              resolve(hashedPassword);
            }
          })
        })
      )
      .then(function(hashedPassword){
        // console.log("blue1")
        
        return queryPromise('INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)', 
        [user.username, hashedPassword, new Date()], connect)
      })
      .then(function(result){
        // console.log("green1");
        return queryPromise('SELECT id, username, createdAt, password, updatedAt FROM users WHERE id = ?', 
        [result.insertId], connect)
      })
      .then(function(result){
        // console.log("pink1");
        return result[0];
      })
      .catch(function(err){
        if(err.code === 'ER_DUP_ENTRY'){
          console.log('A user with this username already exists');
          return "taken";
        }
        else{
          console.log(err, "there was an error");
        }
      })
    },
    //end of CreateUser function
    
    //
    createPost: function(post){
      return(
        queryPromise(`INSERT INTO posts 
        (userId, title, url, createdAt, subredditId, content) VALUES (?, ?, ?, ?, ?, ?)`, 
        [post.userId, post.title, post.url, new Date(), post.sub, post.content], connect)
        .then(function(result){
          return queryPromise(`SELECT 
          p.id ,title ,url ,userId ,p.createdAt ,p.updatedAt ,content
          ,subredditId ,name ,description
          FROM posts p
          Join subreddits s on (p.subredditId = s.id)
          WHERE p.id = ?`, [result.insertId],
          connect);
        })
        .then(function(result){
          var string = JSON.stringify(result, null, 4);
          return(JSON.parse(string)[0]);
        })
      )
    },
    //end of createPost promise function
    
    getPost: function(postId){
      // if(options === false){
      //   options = {};
      // }
      
      // var limit = options.numPerPage || 25; 
      // var offset = (options.page || 0) * limit;
      
      return queryPromise(`select 
        p.id ,title ,url ,p.createdAt ,p.updatedAt ,username ,p.userId ,content
        ,sum(vote) as voteScore
        ,sum(case when vote = 1 then 1 else 0 end) as up
        ,sum(case when vote = -1 then 1 else 0 end) as down
        from posts p 
        join users u on (u.id = p.userId)  
        LEFT JOIN votes v on (p.id = v.postId)
        where p. id = ?
        LIMIT ? OFFSET ?`, 
        [postId, 1, 0], connect)
        .then(function(postResult){
          return postResult;
        })
    },
    //end of getPost function
    
    getAllPosts: function(options){
      if(options === false){
        options = {};
      }
      
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      var sorting = options.sortingMethod;
      
      
      
        if(sorting === "top"){
          sorting = "voteScore";
        }
        else if(sorting === "newest"){
          sorting = "v.createdAt";
        }
        else if(sorting === "hotness"){
          sorting = "sum(vote)/unix_timestamp(v.createdAt)"
        }
        else if(sorting === "controversial"){
          sorting = `CASE
          when sum(case when vote = 1 then 1 else 0 end) < sum(case when vote = -1 then 1 else 0 end)
            then count(vote) * (sum(case when vote = 1 then 1 else 0 end) / sum(case when vote = -1 then 1 else 0 end))
          when sum(case when vote = 1 then 1 else 0 end) > sum(case when vote = -1 then 1 else 0 end)
            then count(vote) * (sum(case when vote = -1 then 1 else 0 end)/sum(case when vote = 1 then 1 else 0 end))
          end`
        }
        //HERE!~!!!
        else{
          sorting = "p.id";
        }
      
      
        
      return queryPromise(`
      SELECT 
      p.id as id, title, url, p.userId, p.createdAt, p.updatedAt ,content
      ,sum(vote) as voteScore
      ,sum(case when vote = 1 then 1 else 0 end) as up
      ,sum(case when vote = -1 then 1 else 0 end) as down
      ,u.id as user ,u.username as Username
      ,s.name ,s.description 
      FROM posts p 
      JOIN users u on (p.userId = u.id)
      JOIN subreddits s on (p.subredditId = s.id)
      LEFT JOIN votes v on (p.id = v.postId)
      GROUP BY p.id
      ORDER BY ${sorting} DESC
      LIMIT ? OFFSET ?
        ` //${sorting} 
        //no need for Left Join, all posts should have subreddits
        // ${} is part of node.js, it tells the program that this
          //is a variable, great for using within backticks 
        , [limit, offset], connect)
        .then(function(results){
          return results;
        })
        .then(function(allPosts){
        // console.log(allPosts);
        
        
          return allPosts.map(function(post){
          post.user = {
              id: post.user, 
              username: post.Username
              
          }
              //add all of our user information to our object
          delete post.Username;
              //delete the extra user information
          
          post["subreddit"] = {
              name: post.name,
              description: post.description
              
          }
              //organize all subreddit info into an object
              //for a neatness factor
          
          delete post.name;
          delete post.description;
              //delete extra subreddit data
          
          return post;   
       })
    })
    
      
    },
    //end of getAllPosts function
    
    getAllPostsforUser: function(options, userId){
      if(options === false){
        options = {};
      }
      
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      
      return queryPromise(`SELECT p.id, 
      title, url, userId, p.createdAt, p.updatedAt ,u.username 
      FROM posts p 
      join users u on (p.userId = u.id) 
      where userId = ?
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?`
      ,[userId, limit, offset], connect)
      .then(function(results){
        return results;
      })
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
        //nicely organize our user posts
      })
    },
    //end of getAllPostsforUser
    
    createSubreddit: function(sub){
      return queryPromise(`INSERT INTO
        subreddits
        (name, description, createdAt)
        values (?, ?, ?)`
        ,[sub.name, sub.description, new Date()], connect)
        .then(function(subResult){
          return subResult;
        })
    },
    //end of createSubreddit function
    
    getAllSubreddits: function(options){
      if(options === false){
        options = {};
      }
      
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      return queryPromise(`select 
        id
        ,name
        ,description
        ,createdAt
        ,updatedAt
        from subreddits
        order by id desc
        limit ? offset ?`
        , [limit, offset], connect)
        .then(function(result){
          return result;
        })
    },
    //end of getAllSubreddits
    
    createOrUpdateVote: function(vote){
      vote.vote = parseInt(vote.vote);
      
      if(vote.vote === 1 || vote.vote === 0 || vote.vote === -1){
         return queryPromise(`INSERT INTO votes 
         SET postId = ?, userId = ?, vote = ?, createdAt = ?
         ON DUPLICATE KEY UPDATE vote = ?, updatedAt = ?`,
         [vote.postId, vote.userId, vote.vote, new Date(),
          //first insert user, post, vote count, and createdAt date
         vote.vote, new Date()], connect)
          //update vote and updatedAt date
         .then(function(results){
           return results;
         })
      }
      else{
        console.log(vote.vote, " is not a proper vote amount.");
        return;
      }
    },
    //end of createVote function
    
    createComment: function(comment){
      return queryPromise(`insert into comments                                               
    (text, userId, postId, parentId)                                             
    values (? ,? ,? ,?)`, 
    [comment.text, comment.userId, comment.postId, comment.parentId], connect)
      .then(function(results){
        return results;
      })
    },
    //end of createComment function
    
    getComments: function(postId){
      
            function getCommentsForPost(postId, maxLevel, currentLevel, parents, postsMap, topLevelPosts){
      
                //Have several parameters for the callback so that the updated objects can replace the original values
                  //for instance, current level will change as the comments become nested but remain
                  //as zero for the first run
              if (currentLevel === 0) {
                return queryPromise('SELECT * FROM comments WHERE postId=? AND parentId IS NULL', [postId], connect)
                  //take the postId from the parameter and find its first comment
                  .then(function(posts) {
                    //posts is an array of top comments, first comments, since 
                      //their parentId is null at the desired post
                    var parents = posts.map(post => post.id);
                      //our parents array now holds all the ids for our
                        //original comments, these are the parentIds for the
                        //replies
                    posts.forEach(post => {
                        //post is the objects within the posts array
                          //all that happens below will affect each
                          //post object =>, arrow function
                      post.replies = [];
                        //make a key within the post object called replies
                          //this should be an array so that it can use
                          //methods later on
                      postsMap[post.id] = post
                        //add our post object to our postMap object
                          //with a key name of the post.id,
                            //the post.id being the id for the original comments
                            //aka the parentId for replies in accordance to each
                            //original comment
                    });
                      //Return within the .then, ie
                      //run the recursive function
                    return getCommentsForPost(postId, maxLevel, 1, parents, postsMap, posts);
                      //constant values
                        //postId, same post
                        //maxLevel, same, three
                      //updated values
                        //current level is now 1, we're moving to the second level
                          //like an array, position 1 is the second value
                        //parents is now an array of parentIds, the ids from
                          //the original comments
                        //postsMap is now an object that holds our post object,
                          //with the empty replies array
                          //with each key being the id of our post object
                            //the post object is our original, parentId null,
                            //comments
                        //topLevelPosts is now an array of objects where each
                          //object is a top level, original, comment.
                  });
              }
              else if (currentLevel >= maxLevel || parents.length === 0) {
                  //if they're aren't any comments, parents array is zero
                    //or the maxLevel has been hit, in this case three
            
            
                return topLevelPosts;
                  //our topLevelPosts is our post object
                    //returning it here causes all our reply posts
                    //to nest, like a factorial multiplying values
                      //together
              }
              else {
                //if our current level is not zero, ie above zero
            
                parents = parents.map(id => parseInt(id));
                   //take the ids of our parent comments in our parents array
                    //and convert the strings into integers
                    //queries are fussy about data types
                      //can't have strings within strings
                return queryPromise(`SELECT * FROM comments WHERE postId=? AND parentId IN (${parents.join(',')})`, [postId] ,connect)
                  //in one fell swoop,
                    //convert our parents array into a string
                      //separated by commas
                    //that our query will use to find all
                    //of the replies,
                        //IN refers to looking for something
                        //that has the desired values
                          //ie
                          //where the parentId is
                          //any of these values
            
                  .then(function(posts) {
                    
                    //posts is an array of objects
                      //where each object is a reply to
                      //a top level comment
                    var parents = posts.map(post => post.id);
                      //make our current replies the new
                        //values for our parents array
                    
                      posts.forEach(post => {
                        
                        post.replies = [];
                          //give our reply comment a replies array
                        postsMap[post.id] = post;
                        
                        postsMap[post.parentId].color = "green";
                        
                        postsMap[post.parentId].replies.push(post);
                          //this affects our topLevelPosts
                            //because our topLevelPosts is the
                            //original post
                              //when it is returned,
                              //all values are put together
                      });
                    
                      
                        //put our reply comment into our object
                // postsMap[post.parentId].replies.push(post);
                        //since our comment is itself a reply,
                          //push it into the replies array of its
                          //parent by calling upon the key of the
                          //same name, the parentId of reply = id of original comment
                    var reply = topLevelPosts[0].replies
            // console.log(reply[1], "blue");
                    return getCommentsForPost(postId, maxLevel, currentLevel + 1, parents, postsMap, topLevelPosts);
                      //static values
                        //postId, always the same post
                        //maxLevel, must remain at a constant three
                          //to avoid an infinite loop
                      //updated values
                        //currentLevel is now one more than before, + 1
                        //parents is now an array of reply ids,
                          //they can be parents too
                        //postsMap now has the replies with key values
                          //as their id number
                          //as well as the replies existing within
                          //the replies array of their parent
                        //topLevelPosts
                          //this 
                  });
              }
      
            }
            //end of getCommentsForPost function
      
      
      
      return getCommentsForPost(postId, 3, 0, parents, postsMap, topLevelPosts)
      .then(function(results){
        return results;
      })
    },
    
    getFive: function(){
      return queryPromise(`select 
      p.id, title, url, username 
      from posts p 
      join users u on (u.id = p.userId) 
      order by p.createdAt desc 
      limit 5;` ,[] ,connect)
      .then(function(results){
        return results;
      })
    }
    
  }
  //end of return
}

function getCommentsForPost(postId, maxLevel, currentLevel, parents, postsMap, topLevelPosts){

          //Have several parameters for the callback so that the updated objects can replace the original values
            //for instance, current level will change as the comments become nested but remain
            //as zero for the first run
        if (currentLevel === 0) {
          return queryPromise('SELECT * FROM comments WHERE postId=? AND parentId IS NULL', [postId], connect)
            //take the postId from the parameter and find its first comment
            .then(function(posts) {
              //posts is an array of top comments, first comments, since 
                //their parentId is null at the desired post
              var parents = posts.map(post => post.id);
                //our parents array now holds all the ids for our
                  //original comments, these are the parentIds for the
                  //replies
              posts.forEach(post => {
                  //post is the objects within the posts array
                post.replies = [];
                  //make a key within the post object called replies
                    //this should be an array so that it can use
                    //methods later on
                postsMap[post.id] = post
                  //add our post object to our postMap object
                    //with a key name of the post.id,
                      //the post.id being the id for the original comments
                      //aka the parentId for replies in accordance to each
                      //original comment
              });
                //Return within the .then, ie
                //run the recursive function
              return getCommentsForPost(postId, maxLevel, 1, parents, postsMap, posts);
                //constant values
                  //postId, same post
                  //maxLevel, same, three
                //updated values
                  //current level is now 1, we're moving to the second level
                    //like an array, position 1 is the second value
                  //parents is now an array of parentIds, the ids from
                    //the original comments
                  //postsMap is now an object that holds our post object,
                    //with the empty replies array
                    //with each key being the id of our post object
                      //the post object is our original, parentId null,
                      //comments
                  //topLevelPosts is now an array of objects where each
                    //object is a top level, original, comment.
            });
        }
        else if (currentLevel >= maxLevel || parents.length === 0) {
            //if they're aren't any comments, parents array is zero
              //or the maxLevel has been hit, in this case three
      
      //QUESTION!
          return topLevelPosts;
            //why do we return this?
            //shouldn't we return the postsMap object since it holds
              //all of the objects and replies arrays?
        }
        else {
          //if our current level is not zero, ie above zero
      
          parents = parents.map(id => parseInt(id));
             //take the ids of our parent comments in our parents array
              //and convert the strings into integers
              //queries are fussy about data types
                //can't have strings within strings
          return queryPromise(`SELECT * FROM comments WHERE postId=? AND parentId IN (${parents.join(',')})`, [postId] ,connect)
            //in one fell swoop,
              //convert our parents array into a string
                //separated by commas
              //that our query will use to find all
              //of the replies,
                  //IN refers to looking for something
                  //that has the desired values
                    //ie
                    //where the parentId is
                    //any of these values
      
            .then(function(posts) {
              //posts is an array of objects
                //where each object is a reply to
                //a top level comment
              var parents = posts.map(post => post.id);
                //make our current replies the new
                  //values for our parents array
              posts.forEach(post => {
                post.replies = [];
                  //give our reply comment a replies array
                postsMap[post.id] = post;
                  //put our reply comment into our object
                    //we cannot easily add replies to
                    //an array of replies, that would
                      //take some more conditions
                    //SO make sure to add it so
                      //that all replies to this reply
                      //have a place to easily go
                postsMap[post.parentId].replies.push(post);
                  //since our comment is itself a reply,
                    //push it into the replies array of its
                    //parent by calling upon the key of the
                    //same name, the parentId of reply = id of original comment
              });
      
              return getCommentsForPost(postId, maxLevel, currentLevel + 1, parents, postsMap, topLevelPosts);
                //static values
                  //postId, always the same post
                  //maxLevel, must remain at a constant three
                    //to avoid an infinite loop
                  //topLevelPosts
                    //this only contains the top level, original
                    //comments, so it stays the same
                //updated values
                  //currentLevel is now one more than before, + 1
                  //parents is now an array of reply ids,
                    //they can be parents too
                  //postsMap now has the replies with key values
                    //as their id number
                    //as well as the replies existing within
                    //the replies array of their parent
            });
        }

      }
      //end of getCommentsForPost function




function thread(array){
  return array.map(function(comment){
    if(comment.parentId === null){
      comment.replies = [];
      return queryPromise(`select 
      id, text, parentId, userId 
      from comments 
      where parentId = ? 
      order by id` 
      ,[comment.id] ,connect)
      .then(function(reply){
        comment.replies.push(reply);
        thread(reply);
        //recursion happens here
        return;
      })
    }
    else{
      comment.replies = [];
      return queryPromise(`select 
      id, text, parentId, userId 
      from comments 
      where parentId = ? 
      order by id` ,[comment.id] ,connect)
      .then(function(reply){
        comment.replies.push(reply);
        return;
      })
    }
    
  })
  //end of map
}
//end of function thread


module.exports = getPromise;

// return queryPromise(`select id, text, parentId, userId from comments where postId = ? and parentId is null order by id`
//       ,[postId] ,connect)


// function commentChain(parentId){
//         return queryPromise(`select id, text, parentId, userId from comments where postId = ? and parentId is ? order by id`
//         ,[postId, parentId] ,connect)
//         .then(function(results){
         
//           return results.map(function(comment){
//             return comment.id;
//           })
//         })
//       }
      
//       return commentChain(null)