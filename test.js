createPost: 
getPromise('INSERT INTO posts (userId, title, url, createdAt) VALUES (?, ?, ?, ?)', [post.userId, post.title, post.url, new Date()],
conn)
.then(function(result){
  return getPromise('SELECT id,title,url,userId, createdAt, updatedAt FROM posts WHERE id = ?', [result.insertId], conn);
})
.catch(function(err){
  console.log(err);
});        
        
        


    
    
    /*
    createPost: function(post, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, createdAt) VALUES (?, ?, ?, ?)', [post.userId, post.title, post.url, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            
            //Post inserted successfully. Let's use the result.insertId to retrieve
            //the post and send it to the caller!
            
            conn.query(
              'SELECT id,title,url,userId, createdAt, updatedAt FROM posts WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    */
    
    
    
    
    
    
    
    
    