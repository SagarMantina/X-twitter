const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const {
  createPost,
  removePost,
  likeTogglePost,
  commentPost,
  getUserPosts,
  getFollowingPosts,
  getLikedPosts,
  getAllPosts,
  getPosts,
  loadPosts,
 
} = require("../controllers/postController");
`1`
router.get("/liked/:id", protectRoute, getLikedPosts);

router.get("/following", protectRoute, getFollowingPosts);

router.get("/all", protectRoute, getAllPosts);

router.get("/userposts/:id", protectRoute, getUserPosts);

router.post("/create", protectRoute, createPost);

router.post("/like/:id", protectRoute, likeTogglePost);

router.post("/comment/:id", protectRoute, commentPost);

router.get("/remove/:id", protectRoute, removePost);

router.post("/posts/:id", protectRoute, getPosts);


router.get("/posts/:id",protectRoute, loadPosts);

module.exports = router;
