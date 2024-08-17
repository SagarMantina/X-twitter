const express = require("express");
const router = express.Router();
const { postlogin, postsignup, getlogout, getMe , getlogin, getsignup ,gethome,getMain} = require("../controllers/authController");
const protectRoute = require("../middleware/protectRoute");

router.get("/me", protectRoute, getMe);
router.post("/login", postlogin);
router.post("/signup", postsignup);
router.get("/logout", getlogout);

router.get("/login", getlogin);

router.get("/signup", getsignup);

router.get("/home", gethome);

router.get("/",getMain);



module.exports = router;
