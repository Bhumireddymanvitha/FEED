const QUERIES = {
  USERS_INSERT :'INSERT INTO users (name,email,password,pic,id,DOB) VALUES (?,?,?,?,?,?)',
  USERS_CHECK :'SELECT name,password FROM users WHERE email = ?;',
  USERS_UPDATE: 'UPDATE users  set password=resetPassword where email= ?',
  POST_INSERT : 'INSERT INTO post (postid,title,image,id) VALUES (?,?,?,?)',
  HOME_SELECT: 'SELECT u.name,u.id,u.pic,u.DOB,p.postid,p.title,p.image,p.datetime from users u inner join post p  where u.id= p.id order by p.datetime desc ',
  PROFILE_SELECT:'SELECT  u.id,u.name,u.pic,u.email,u.DOB,(select count(p.postid)from post p where p.id=u.id) as count from users u ',
  PROFILE_DELETE: 'DELETE from users where id = ?',
  EDIT_SELECT: 'SELECT name,email,pic from users where id=?',
  PROFILE_UPDATE: 'UPDATE users set name=?,email=?,DOB=? where id = ?;',
  COMMENT_SELECT: 'SELECT postid,commentid,comment,name from comment',
  COMMENT_INSERT:'INSERT INTO comment (postid,commentid,comment,name) values (?,?,?,?)',
  COMMENT_DELETE:'DELETE from comment where commentid = ?',
  POST_DELETE: 'DELETE from post where postid = ?',
  USERS_SELECT: 'SELECT name,id,pic from users where name=?',
  COMMENT_COUNT: 'select p.postid,p.image,p.title,(select count(c.commentid)from comment c where c.postid=p.postid) as count,(select count(l.postid)from likes l  where p.postid=l.postid and l.likes=1) as likes_count from post p;',
  RESET_PASS:'UPDATE user set password=? where email=?',
  LIKE_INSERT:'INSERT into likes (postid,id,likes) values(?,?,?)',
  LIKE_UPDATE:'UPDATE likes set like=? where id=?',
  LIKE_SELECT:'SELECT postid,likes from likes where id=? and postid=?',
  LIKE_COLOUR:'SELECT likes,postid,id from likes where id =?',
  MYPOST_SELECT: 'SELECT u.name,u.id,u.pic,u.DOB,p.postid,p.title,p.image,p.datetime from users u inner join post p  where u.id= p.id and p.id=? order by p.datetime desc',

  }
  
  module.exports = { QUERIES } 
  
  