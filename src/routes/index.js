const express = require("express");
const router = express.Router();
const ViewController = require("../controller/view-controller");
const auth = require("../middleware/autho");
const upload = require("../middleware/multer");

//signauth
router.get("/", (req, res) => {
  res.redirect('/signin');
});
router.get("/signup", ViewController.getSignup);
router.post("/signUp", upload.single("pic"), ViewController.signUp);
router.get("/signin", ViewController.getSignin);
router.post("/signIn", ViewController.signIn);
router.get("/getNewPassword", ViewController.getNewPassword);
router.post("/resetPassword", ViewController.resetPassword);
router.get("/newPassword/:token", ViewController.newPass);
router.post("/resetnewPassword/:email/:token", ViewController.newPassword);

//post
router.get("/home", auth, ViewController.getHome);
router.get("/post", auth, ViewController.getPost);
router.post(
  "/createpost",
  auth,
  upload.single("image"),
  ViewController.createPost
);
router.get("/profile", auth, ViewController.getProfile);
router.get("/profile/delete/:id", auth, ViewController.deleteProfile);
router.get("/post/:postid", auth, ViewController.getpostbyid);
router.get("/comment/delete/:id", auth, ViewController.commentdelete);
router.get("/edit/:id", auth, ViewController.editProfile);
router.post("/update/:id", auth, ViewController.updateProfile);
router.post("/addComment/:postid", auth, ViewController.addComment);
router.get("/myPost", auth, ViewController.mypost);
router.get("/delete/:postid", auth, ViewController.deletepost);
router.get("/profile/:id", auth, ViewController.userProfile);
router.get("/post/edit/:postid", auth, ViewController.editPost);
router.post("/post/update/:id", auth, ViewController.updatePost);
router.get("/logout", auth, ViewController.logout);
// router.get('/getlikes',ViewController.getlikes);
router.post("/likes/:postid/:count", auth, ViewController.likepost);
router.get("/notification",auth,ViewController.getnotification);
router.get("/notificationdelete/:notificationid",auth,ViewController.deletenotification)

module.exports = router;
