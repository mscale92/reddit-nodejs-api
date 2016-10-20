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
        console.log("blue1")
        return queryPromise('INSERT INTO users (username,password, createdAt) VALUES (?, ?, ?)', 
        [user.username, hashedPassword, new Date()], connect)
      })
      .then(function(result){
        console.log("green1");
        return queryPromise('SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', 
        [result.insertId], connect)
      })
      .then(function(result){
        console.log("pink1");
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
        queryPromise('INSERT INTO posts (userId, title, url, createdAt) VALUES (?, ?, ?, ?)', 
        [post.userId, post.title, post.url, new Date()], connect)
        .then(function(result){
          return queryPromise('SELECT id,title,url,userId, createdAt, updatedAt FROM posts WHERE id = ?', [result.insertId],
          connect);
        })
        .then(function(result){
          var string = JSON.stringify(result, null, 4);
          return(JSON.parse(string)[0]);
        })
      )
    },
    //end of createPost promise function
    
    //
    
    getAllPosts: function(options){
      // if(options === false){
      //   options = {};
      // }
      
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      
      return queryPromise(`
      SELECT 
      p.id as id, title, url, userId, p.createdAt, p.updatedAt 
      ,u.id as user ,u.username as Username ,u.createdAt as uCreatedAt ,u.updatedAt as uUpdatedAt 
      FROM posts p join users u on (p.userId = u.id) 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
        `
        , [limit, offset], connect)
        .then(function(results){
          return results;
        })
      
    }
  }
}



module.exports = getPromise;

`
        SELECT id, title, url, userId, createdAt, updatedAt
        FROM posts
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?`