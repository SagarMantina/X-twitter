const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const router = express.Router();
const {
  postUserProfile,
  getSuggested,
  followToggle,
  updateProfile,
  getNot,
  deleteNot,
  deleteNots,
  getUserProfile,
  postNot,
} = require("../controllers/profileController");

router.post("/profile/:username", protectRoute, postUserProfile);

router.get("/profile/:username", protectRoute, getUserProfile);


router.get("/suggested", protectRoute, getSuggested);

router.get("/follow/:id", protectRoute, followToggle);

router.post("/update", protectRoute, updateProfile);


router.get("/notifications", protectRoute, getNot);

router.post("/notifications", protectRoute, postNot);

router.get("/remove_notification/:id", protectRoute, deleteNot);

router.get("/remove_notifications", protectRoute, deleteNots);

module.exports = router;


