const dal = require("../dal/index");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const nodemailer = require("nodemailer");
const cloudinary = require("../middleware/cloudinary");
const { v1: uuidv1 } = require("uuid");
const { Console } = require("console");
const { request } = require("http");

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("db connected");
});
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

function getSignup(req, res) {
  let message = "";
  res.render("signUp", { message });
}
async function signUp(req, res) {
  console.log(req.file);
  const { name, email, password ,dob} = req.body;
  const id = uuidv1();

  const uploader = async (path) => await cloudinary.images(path, "images");
  if (req.method === "POST") {
    const file = req.file;
    const { path } = file;

    var newPath = await uploader(path);
    console.log(newPath.id);
    fs.unlinkSync(path);
    con.query(
      "Select name,password,id from users where email=? || name=?",
      [email, name],
      async (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
          var Password = await bcrypt.hash(password, 10);
          dal.signUp_Insert(
            [name, email, Password, newPath.id, id,dob],
            (err, results) => {
              if (err) throw err;
              console.log(result);
            }
          );

          res.redirect("/signin");
        } else {
          let message = "User already exist!";
          res.render("signUp", { message });
        }
      }
    );
  }
}

function getSignin(req, res) {
  let message = "";
  res.render("signIn", { message });
}

function signIn(req, res) {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res.status(422).json({
      error: "Please provide email/password !",
    });
  }
  con.query(
    "Select name,password,id from users where email=?",
    [email],
    (err, result) => {
      if (err) throw err;
      if (result.length != 0) {
        console.log(result[0]);
        bcrypt.compare(password, result[0].password, (err, response) => {
          if (err) throw err;
          if (response) {
            const token = jwt.sign(
              {
                user_id: result[0].id,
                user_name: result[0].name,
              },
              process.env.TOKEN_KEY,
              {
                expiresIn: "2h",
              }
            );
            res.cookie("token", token);

            res.redirect("/home");
          } else {
            let message = "incorrect username or password";
            res.render("signin", { message });
          }
        });
      } else {
        let message = "User doesn't exists..";
        res.render("signin", { message });
      }
    }
  );
}

function getNewPassword(req, res) {
  var message = "";
  res.render("resetpass", { message });
}
async function newPassword(req, res) {
  const newPassword = req.body.password;
  const cpassword = req.body.cpassword;
  const email = req.params.email;

  if (newPassword == cpassword) {
    var Password = await bcrypt.hash(newPassword, 10);
    con.query(
      "update users set password=? where email=?",
      [Password, email],
      (err, results) => {
        res.redirect("/signin");
      }
    );
  } else {
    res.render("newpassword");
  }
}

function getPost(req, res) {
  res.render("post");
}
async function createPost(req, res) {
  const { title } = req.body;
  var userId = req.user.user_id;
  if(!req.file){
    con.query(
      "INSERT INTO post (postid,title,image,id) VALUES (?,?,?,?)",
      [uuidv1(), title, null, userId],
      (err, results) => {
        if (err) throw err;
        console.log(results);
        res.redirect("/home");
      }
    );
  }else{
  const uploader = async (path) => await cloudinary.images(path, "images");
  if (req.method === "POST") {
    const file = req.file;
    console.log(file);
    const { path } = file;
    var newPath = await uploader(path);
    console.log(newPath);
    fs.unlinkSync(path);
  } else {
  }
  con.query(
    "INSERT INTO post (postid,title,image,id) VALUES (?,?,?,?)",
    [uuidv1(), title, newPath.id, userId],
    (err, results) => {
      if (err) throw err;
      console.log(results);
      res.redirect("/home");
    }
  );
}
}

async function getHome(req, res) {
  console.log(req.user.user_id);
  const firstQuery = new Promise((success, failure) => {
    dal.home_Select((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const secondQuery = new Promise((success, failure) => {
    dal.comment_Select((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const thirdQuery = new Promise((success, failure) => {
    dal.count_Comments((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const fourthQuery = new Promise((success, failure) => {
    con.query(
      "SELECT likes,postid,id from likes where id =?",
      req.user.user_id,
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          const retVal = results;
          success(retVal);
        }
      }
    );
  });
  const fifthQuery = new Promise((success, failure) => {
    con.query(
      "select u.name,u.pic,u.id,l.postid,l.likes from users u inner join likes l where u.id=l.id and l.likes=1",
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          const retVal = results;
          success(retVal);
        }
      }
    );
  });
  const sixthQuery = new Promise((success, failure) => {
    con.query(
      "select name,id,pic,DOB from users",
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          const retVal = results;
          success(retVal);
        }
      }
    );
  });

  Promise.all([firstQuery, secondQuery, thirdQuery, fourthQuery,fifthQuery,sixthQuery]).then(
    (firstResult) => {
      // console.log(new Date(firstResult[0][6].DOB));
      res.render("home", {
        results: firstResult[0],
        comment: firstResult[1],
        count: firstResult[2],
        likes: firstResult[3],
        likedusers: firstResult[4],
        dob: firstResult[5],
        username: req.user.user_name,
        id: req.user.user_id,
      });
    }
  );
}

function getProfile(req, res) {
  const firstQuery = new Promise((success, failure) => {
    dal.profile_Select((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const secondQuery = new Promise((success, failure) => {
    dal.home_Select((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });

  Promise.all([firstQuery, secondQuery]).then((firstResult) => {
    // console.log(firstResult[0]);
    res.render("profile", {
      results: firstResult[0],
      post: firstResult[1],
      id: req.user.user_id,
      userId: req.user.user_id,
    });
  });
}

function userProfile(req, res) {
  var id = req.params.id;
  const firstQuery = new Promise((success, failure) => {
    dal.profile_Select((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const secondQuery = new Promise((success, failure) => {
    dal.home_Select((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });

  Promise.all([firstQuery, secondQuery]).then((firstResult) => {
    console.log(firstResult[1]);
    res.render("profile", {
      results: firstResult[0],
      post: firstResult[1],
      id: id,
      userId: req.user.user_id,
    });
  });
}

function deleteProfile(req, res) {
  var id = req.params.id;
  dal.profile_Delete(id, (err, results) => {
    if (err) throw err;
  });
  res.clearCookie("token");
  res.redirect("/signup");
}

function commentdelete(req, res) {
  var id = req.params.id;
  dal.comment_Delete(id, (err, results) => {
    if (err) throw err;
  });
  res.redirect("/home");
}
function editProfile(req, res) {
  var id = req.params.id;
  con.query(
    "SELECT name,email,pic from users where id=?",
    id,
    (err, results) => {
      if (err) throw err;
      res.render("edit", {
        results,
        userId: req.user.user_id,
        id,
      });
    }
  );
}

function updateProfile(req, res) {
  var id = req.params.id;
  var name = req.body.name;
  var email = req.body.email;
  var dob = req.body.DOB;

  dal.profile_Update([name, email,dob,id], (err, results) => {
    if (err) throw err;
  });
  res.redirect("/profile");
}

function addComment(req, res) {
  var postid = req.params.postid;
  var name = req.user.user_name;
  var comment = req.body.comment;
  var commentid = uuidv1();
  dal.comment_Insert([postid, commentid, comment, name], (err, results) => {
    if (err) throw err;
  });
  res.redirect("/home");
}

function mypost(req, res) {
  var id = req.user.user_id;
  const firstQuery = new Promise((success, failure) => {
    con.query("SELECT u.name,u.id,u.pic,u.DOB,p.postid,p.title,p.image,p.datetime from users u inner join post p  where u.id= p.id and p.id=? order by p.datetime desc",id,(err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const thirdQuery = new Promise((success, failure) => {
    dal.count_Comments((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const fourthQuery = new Promise((success, failure) => {
    con.query(
      "SELECT likes,postid,id from likes where id =?",
      req.user.user_id,
      (err, results) => {
        if (err) {
          failure(err);
        } else {
          const retVal = results;
          success(retVal);
        }
      }
    );
  });

  Promise.all([firstQuery, thirdQuery, fourthQuery]).then((firstResult) => {
    console.log(firstResult[0]);
    res.render("mypost", {
      results: firstResult[0],

      count: firstResult[1],
      likes: firstResult[2],
      id,
    });
  });
}
function getpostbyid(req, res) {
  var id = req.user.user_id;
  var postid = req.params.postid;
  console.log("hi");
  const firstQuery = new Promise((success, failure) => {
    dal.home_Select((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const thirdQuery = new Promise((success, failure) => {
    dal.count_Comments((err, results) => {
      if (err) {
        failure(err);
      } else {
        const retVal = results;
        success(retVal);
      }
    });
  });
  const fourthQuery = new Promise((success, failure) => {
    con.query(
      "SELECT likes,postid,id from likes where id =?",
      req.user.user_id,
      (err, results) => {
        if (err) {
          failure(err);
        } else {
          const retVal = results;
          success(retVal);
        }
      }
    );
  });

  Promise.all([firstQuery, thirdQuery, fourthQuery]).then((firstResult) => {
    console.log(firstResult[0]);
    res.render("postbyid", {
      results: firstResult[0],
      postid,
      count: firstResult[1],
      likes: firstResult[2],
      id,
    });
  });
}

function editPost(req, res) {
  var id = req.params.postid;
  console.log("test");
  con.query(
    "SELECT title,image from post where postid = ?",
    id,
    (err, results) => {
      if (err) throw err;
      res.render("edit", {
        results,
        userId: req.user.user_id,
        id,
      });
    }
  );
}

function updatePost(req, res) {
  var id = req.params.id;
  var title = req.body.title;

  con.query(
    "UPDATE post set title=? where postid = ?",
    [title, id],
    (err, results) => {
      if (err) throw err;
      res.redirect("/home");
    }
  );
}
function deletepost(req, res) {
  var postid = req.params.postid;
  dal.post_Delete(postid, (err, results) => {
    if (err) throw err;
  });
  res.redirect("/home");
}
function logout(req, res) {
  res.clearCookie("token");
  res.redirect("/signin");
}
function resetPassword(req, res) {
  console.log("hi");
  con.query(
    "SELECT email from users where email=? and name=?",
    [req.body.email, req.body.name],
    (err, results) => {
      console.log(results);
      if (results != 0) {
        const token = jwt.sign(
          {
            user_id: req.body.email,
          },
          process.env.TOKEN_KEY,
          {
            expiresIn: "10min",
          }
        );

        var mailOptions = {
          from: '"feed@gmail.com',
          to: req.body.email,
          subject: "Password Reset",
          html: `
        <h1> FEED APP </h1>
        <p>You have requested for password reset!!</p>
        <h5>Click on this <a href="http://localhost:8090/newPassword/${token}">link</a> to reset password</h5>`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.response);
        });

        res.send(
          "<h1 style='text-align:center; padding-top:40px' >Check your mail!! if you didn't recieve mail <a href='/getNewPassword'>click here..</a></h1><h2 style='text-align:center; padding-top:10px'>If not you <a href='/signin'>signin here!!</a></h2>"
        );
      } else {
        let message = "incorrect username or email";
        res.render("resetpass", { message });
      }
    }
  );
}
function newPass(req, res) {
  var token = req.params.token;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  console.log(decoded);
  res.render("newpassword", { token, email: decoded.user_id });
}
function likepost(req, res) {
  var postid = req.params.postid;
  var userid = req.user.user_id;
  var count = req.params.count;

  console.log(typeof count);
  console.log(postid);
  if (count === "true") {
    count = true;
  } else if (count === "false") {
    count = false;
  }
  console.log(count);
  con.query(
    "SELECT postid,likes from likes where id=? and postid=?",
    [userid, postid],
    (err, results) => {
      if (err) throw err;

      console.log(results);
      if (results.length == 0) {
        con.query(
          "INSERT into likes (postid,id,likes) values(?,?,?)",
          [postid, userid, count],
          (err, results) => {
            if (err) throw err;
            res.status(204).send();
          }
        );

      } else {
        con.query(
          "update likes set likes=?  where id=? and postid=?",
          [count, userid, postid],
          (err, results) => {
            console.log(results);
            if (err) throw err;
            res.status(204).send();
          }
        );
      }
    }
  );
}



module.exports = {
  getSignin,
  getNewPassword,
  getSignup,
  signUp,
  signIn,
  newPassword,
  createPost,
  getHome,
  getPost,
  getProfile,
  deleteProfile,
  editProfile,
  updateProfile,
  addComment,
  commentdelete,
  mypost,
  deletepost,
  userProfile,
  editPost,
  updatePost,
  logout,
  resetPassword,
  newPass,
  likepost,
  getpostbyid,
};
