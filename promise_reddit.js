var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
//bcrypt mod

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


function getPromise(connect){
  return {
    
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
        return queryPromise('INSERT INTO users (username,password, createdAt) VALUES (?, ?, ?)', 
        [user.username, hashedPassword, new Date()], connect)
      })
      .then(function(result){
        // console.log("green1");
        return queryPromise('SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', 
        [result.insertId], connect)
      })
      .then(function(result){
        // console.log("pink1");
        return result[0];
      })
      .catch(function(err){
        if(err.code === 'ER_DUP_ENTRY'){
          console.log('A user with this username already exists');
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
        (userId, title, url, createdAt, subredditId) VALUES (?, ?, ?, ?, ?)`, 
        [post.userId, post.title, post.url, new Date(), post.subredditId], connect)
        .then(function(result){
          return queryPromise(`SELECT 
          p.id,title,url,userId, p.createdAt, p.updatedAt
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
    
    getPost: function(options, postId){
      if(options === false){
        options = {};
      }
      
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      
      return queryPromise(`select 
        p.id ,title ,url ,p.createdAt ,p.updatedAt ,username ,userId
        from posts p 
        join users u on (u.id = p.userId)  
        where p. id = ?
        LIMIT ? OFFSET ?`, 
        [postId, limit, offset], connect)
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
      
      return queryPromise(`
      SELECT 
      p.id as id, title, url, userId, p.createdAt, p.updatedAt 
      ,u.id as user ,u.username as Username
      ,s.name ,s.description 
      FROM posts p 
      JOIN users u on (p.userId = u.id)
      JOIN subreddits s on (p.subredditId = s.id)
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
        ` //no need for Left Join, all posts should have subreddits
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
          delete post.subCreated;
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
    }
    //end of createVote function
    
  }
  //end of return
}



module.exports = getPromise;

