const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");

const cloudinary = require('cloudinary').v2;


const User = require("../models/userModel");
const Notification = require("../models/notificationModel");






const postNot = async (req, res) => {
    try{
          const curr_username= req.cookies.username;

          const user = await User.findOne({username: curr_username});

          const notifications = await Notification.find({to: user._id}).
          sort({createdAt: -1}).populate({ path: "from", select: "-password" });

          res.status(200).json(notifications);
    }

    catch(error){

      console.log(error);
     return res.status(500).json({ error: "Internal Server Error" });
    }
  }
 


  const getNot = async(req,res)=>{
    try{
      res.sendFile(path.join(__dirname, "../public/notifications.html"));
    }
    catch(error){
       return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const deleteNots = async(req,res)=>{
    try{
        const curr_username= req.cookies.username;
        const user= await User.findOne({username: curr_username});

        await Notification.deleteMany({to: user._id});

        res.status(200).json({message:"All Notifications deleted successfully"});
    }
    catch(error){
       return res.status(500).json({ error: "Internal Server Error" });
    }
  }


  const deleteNot = async(req,res)=>{
    try{
        const id = req.params.id;

        await Notification.findByIdAndDelete(id);

        res.status(200).json({message:"Notification deleted successfully"});
    }
    catch(error){
       return res.status(500).json({ error: "Internal Server Error" });
    }
  }

const postUserProfile = async (req, res) => {
  const  username  = req.params;

  try {
    const user = await User.findOne( username );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../public/profile.html"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

}

const followToggle = async (req, res) => {
  try {
    const { id } = req.params;
    const curr_username = req.cookies.username;

    const currUser = await User.findOne({ username: curr_username });
    const user = await User.findById(id);

    if (!user || !currUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (id === currUser._id.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

  
    if (user.followers.includes(currUser._id)) {
      //unfollow
      user.followers.pull(currUser._id);
      currUser.following.pull(id);
      await user.save();
      await currUser.save();

      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      //follow
      user.followers.push(currUser);
      currUser.following.push(id);
      await user.save();
      await currUser.save();

      const notification = new Notification({
        from: currUser._id,
        to: id,
        type: "follow",
        read: false,
      });
      await notification.save();
      res.status(200).json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSuggested = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.cookies.username });
    const following = user.following;

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: user._id },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filter_users = users.filter((user) => {
      return !following.includes(user._id);
    });

    const suggested_users = filter_users.slice(0, 4);

    suggested_users.forEach((user) => {
      user.password = undefined;
    });

    res.status(200).json(suggested_users);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
    const username = req.cookies.username;
  
    try {
      // Check if username is present in cookies
      if (!username) {
        return res.status(400).json({ error: "Username is required in cookies" });
      }
  
      // Find the user by username
      let user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const { fullname, bio } = req.body;
      let { profileImg, coverImg } = req.body;
      const newUsername = req.body.username; // Rename to avoid conflict
  
      // Handle profile image upload
      if (profileImg) {
        try {
          if (user.profileImg) {
            await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
          }
          const upload_response = await cloudinary.uploader.upload(profileImg);
          profileImg = upload_response.secure_url;
        } catch (err) {
          console.error("Error uploading profile image:", err);
          return res.status(500).json({ error: "Error uploading profile image" });
        }
      }
  
      // Handle cover image upload
      if (coverImg) {
        try {
          if (user.coverImg) {
            await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
          }
          const upload_response = await cloudinary.uploader.upload(coverImg);
          coverImg = upload_response.secure_url;
        } catch (err) {
          console.error("Error uploading cover image:", err);
          return res.status(500).json({ error: "Error uploading cover image" });
        }
      }
  
      // Update user information
      user.fullname = fullname || user.fullname;
      user.username = newUsername || user.username;
      user.bio = bio || user.bio;
      user.profileImg = profileImg || user.profileImg;
      user.coverImg = coverImg || user.coverImg;
  
      // Save updated user
      await user.save();
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.log( error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
module.exports = { postUserProfile, followToggle, updateProfile, getSuggested , getNot, postNot, deleteNot, deleteNots , getUserProfile};
