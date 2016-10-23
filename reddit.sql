-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(60) NOT NULL, -- why 60??? ask me :)
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`), -- why did we add this here? ask me :)
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Mary's additions

-- This creates the table subreddits.
create table `subreddits` (
  `id` int primary key auto_increment not null, 
  `name` varchar(30) unique key NOT NULL, 
  `description` varchar(200) DEFAULT NULL,
  `createdAt` datetime not null, 
  `updatedAt` datetime not null
);



-- This alters the posts table to have a subreddit id that is a foreign key
alter table
`posts`
add (`subredditId` int, foreign key (subredditId) references `subreddits` (id) on delete set null
);

-- This creates a votes table
create table votes 
(postId int(11), userId int(11), constraint `postId` foreign key (postId) references posts(id) 
,constraint `userId` foreign key (userId) references users(id), primary key (userId, postId)
,vote tinyint, createdAt datetime not null, updatedAt datetime not null)


-- This creates a comments table

create table comments (id int primary key auto_increment 
,`text` text 
,createdAt datetime 
,updatedAt datetime 
,userId int ,foreign key (userId) references users (id) 
,postId int ,foreign key (postId) references posts (id) 
,parentId int default null);