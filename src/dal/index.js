const mysql = require("mysql2");
const dotenv = require("dotenv");
const { QUERIES } = require("../constants/constants");

dotenv.config();

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

let connectionCreated = null;
let connectionFailed = null;
const connectionPromise = new Promise((res, rej) => {
  connectionCreated = res;
  connectionFailed = rej;
});

con.connect(function (err) {
  if (err) {
    connectionFailed(err);
    return;
  } else {
    connectionCreated();
  }
});
function signUp_Insert(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.USERS_INSERT, callback);
    })
    .catch((err) => callback(err));
}
function signUp_Check(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.USERS_CHECK, callback);
    })
    .catch((err) => callback(err));
}
function password_Update(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.USERS_UPDATE, callback);
    })
    .catch((err) => callback(err));
}
function post_Insert(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.POST_INSERT, callback);
    })
    .catch((err) => callback(err));
}
function home_Select(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.HOME_SELECT, callback);
    })
    .catch((err) => callback(err));
}
function profile_Select(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.PROFILE_SELECT, callback);
    })
    .catch((err) => callback(err));
}
function profile_Delete(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.PROFILE_DELETE, callback);
    })
    .catch((err) => callback(err));
}
function profile_Edit(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.EDIT_SELECT, callback);
    })
    .catch((err) => callback(err));
}
function profile_Update(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.PROFILE_UPDATE, callback);
    })
    .catch((err) => callback(err));
}
function comment_Select(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.COMMENT_SELECT, callback);
    })
    .catch((err) => callback(err));
}
function comment_Insert(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.COMMENT_INSERT, callback);
    })
    .catch((err) => callback(err));
}
function comment_Delete(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.COMMENT_DELETE, callback);
    })
    .catch((err) => callback(err));
}
function post_Delete(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.POST_DELETE, callback);
    })
    .catch((err) => callback(err));
}
function user_Select(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.USERS_SELECT, callback);
    })
    .catch((err) => callback(err));
}
function count_Comments(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.COMMENT_COUNT, callback);
    })
    .catch((err) => callback(err));
}
function reset_pass(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.RESET_PASS, callback);
    })
    .catch((err) => callback(err));
}
function add_like(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.LIKE_INSERT, callback);
    })
    .catch((err) => callback(err));
}
function un_like(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.LIKE_UPDATE, callback);
    })
    .catch((err) => callback(err));
}
function select_like(callback) {
  connectionPromise
    .then(() => {
      con.query(QUERIES.LIKE_SELECT, callback);
    })
    .catch((err) => callback(err));
}

function colour_select(callback) {
  connectionPromise
    .then(() => {
      con.query("SELECT likes,postid,id from likes where id =?", callback);
    })
    .catch((err) => callback(err));
}
module.exports = {
  signUp_Insert,
  signUp_Check,
  password_Update,
  post_Insert,
  home_Select,
  profile_Select,
  profile_Delete,
  profile_Edit,
  profile_Update,
  comment_Insert,
  comment_Select,
  comment_Delete,
  post_Delete,
  user_Select,
  count_Comments,
  reset_pass,
  add_like,
  un_like,
  select_like,
  colour_select,
};
