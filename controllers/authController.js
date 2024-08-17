const User = require("../models/userModel");
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");

const postsignup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid Email Format" });
    }

    const existUser = await User.findOne({ username: username });
    if (existUser) {
      return res.status(400).json({ error: "Username is already Taken" });
    }

    const existEmail = await User.findOne({ email: email });
    if (existEmail) {
      return res.status(400).json({ error: "Email is Already Taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password Must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
   
    res.redirect("/home");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const postlogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const exists = await User.findOne({ username });

    if (!exists) {
      console.log("User not found for username:", username);
      return res.status(401).json({ error: "Username not found" });
    }

    const isPass = await bcrypt.compare(password, exists.password);

    if (isPass) {
      res.cookie("username", username);
      res.redirect("/home");
 
    } else {
      res.status(401).json({ error: "Incorrect password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getlogout = async (req, res) => {
  try {
    res.clearCookie("username");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const getlogin = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../public/login.html"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getsignup = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../public/signup.html"));
   
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const gethome = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../public/home.html"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


async  function getMain (req, res) {
  try {
    if(req.cookies.username)
      {
        res.redirect("/home");
      }
     else{
      res.redirect("/login");
     }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: " Server Is Down wait For Some Time" });
  }
}
module.exports = { postlogin, postsignup, getlogout, getMe , getlogin, getsignup ,gethome,getMain };
