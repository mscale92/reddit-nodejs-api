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


function getPromise(connect){

  return {
    
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
            //use our compare password promise to see if the entered password
              //and the saved hashed password are the same.
        }
      })
      .then(function(results){
        //results will be a boolean, true
          //if it is false, it will sent to the catch
          //and be undefined
        return results;
      })
      .catch(function(err){
        if(err === "passDNE"){
          console.log("Incorrect Password");
          return err;
        }
        // else if(err === "passDNE"){
          
        // }
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
          return postResult[0];
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
        else if(sorting === "hot"){
          sorting = "sum(vote)/unix_timestamp(v.createdAt)"
        }
        else if(sorting === "contro"){
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
      p.id as id, title, url, p.userId, p.createdAt, p.updatedAt
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
    
    getCommentsforPost: function(postId){
      return queryPromise(`select 
            id, text, parentId, userId 
            from comments 
            where parentId is null 
            order by id`, [postId], connect)
      .then(function(results){
      function thread(array){
        return array.map(function(comment){
          
           
            return queryPromise(`select 
            id, text, parentId, userId 
            from comments 
            where parentId = ? 
            order by id` 
            ,[comment.id] ,connect)
            .then(function(reply){
              comment.replies = reply;
              if(reply[0] === false){
                return comment;
              }
              else{
              thread(comment.replies);
              //recursion happens here
              return comment;
              }
            })
        
          
        })
        //end of map
      }
      
      
      return Promise.all(thread(results));
      })
      .then(function(results){
        results = JSON.stringify(results, null, 4)
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