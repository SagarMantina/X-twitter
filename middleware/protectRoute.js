const User = require("../models/userModel");

const protectRoute = async (req, res, next) => {
  try {
    const username = req.cookies.username;

    if (!username) {
      return res.status(401).json({ error: "You need to login first" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = protectRoute;
