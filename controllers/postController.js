

const User = require("../models/userModel");
const Post = require("../models/postModel");
const Notification = require("../models/notificationModel");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

// const createPost = async (req, res) => {
//   try {
//     const { text } = req.body;
//     let { img } = req.body;
//     const username = req.cookies.username;

//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check if the post content is empty
//     if (!text && !img) {
//       return res.status(400).json({ error: "Post cannot be empty" });
//     }

//     // Handle image upload
//     if (img) {
//       try {
//         const upload_response = await cloudinary.uploader.upload(img);
//         img = upload_response.secure_url;
//         console.log(img);
//       } catch (err) {
//         return res.status(500).json({ error: "Error uploading image" });
//       }
//     }


//     if(!img)
//     {
//       console.log("No img found");
//     }

//     // Create new post
//     const new_post = new Post({
//       user: user._id,
//       text,
//       img: img,
//     });

//     // Save new post
//     await new_post.save();
//     const post_data = await Post.findById(new_post._id).populate("user");
//     // Send response
//     res.status(200).json(post_data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const username = req.cookies.username;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the post content is empty
    if (!text && !img) {
      return res.status(400).json({ error: "Post cannot be empty" });
    }

    let imgUrl;
    if (img) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(img);
        imgUrl = uploadResponse.secure_url;

        console.log(typeof imgUrl);
        console.log(imgUrl);
      } catch (err) {
        return res.status(500).json({ error: "Error uploading image" });
      }
    }

   

    const newPost = new Post({
      user: user._id,
      text,
      img: imgUrl,
    });

    await newPost.save();
    const postData = await Post.findById(newPost._id).populate("user");
    res.status(200).json(postData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removePost = async (req, res) => {
  try {
    const postId = await Post.findById(req.params.id);

    if (!postId) {
      return res.status(404).json({ error: "Post not found" });
    }
    const uname = req.cookies.username;
    const un = await User.findOne({ username: uname });

    if (postId.user.toString() !== un._id.toString()) {
      return res
        .status(401)
        .json({ error: "Unauthorized You cant delete others post" });
    }

    if (postId.img) {
      await cloudinary.uploader.destroy(
        postId.img.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const likeTogglePost = async (req, res) => {
  try {
    const t = req.cookies.username;
    const un = await User.findOne({ username: t });
    const userId = un._id;

    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postOwner = await User.findOne({ _id: post.user });

    if (!postOwner) {
      return res.status(404).json({ error: "Post owner not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      // res.status(200).json(updatedLikes);
      res.status(200).json("unliked");
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: postOwner._id,
        type: "like",
      });
      await notification.save();

      const updatedLikes = post.likes;
      res.status(200).json("liked");
      // res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeTogglePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const username = req.cookies.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!text) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    const postOwner = await User.findOne({ _id: post.user });
    
   
    post.comments.push({
      text,
      user: user._id,
    });

    await post.save();

    const notification = new Notification({
      from: user._id,
      to: postOwner._id,
      type: "comment",
      pid: post._id,
    });
    await notification.save();
   
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getUserPosts = async (req, res) => {
  try {
    const { id: user_id } = req.params;

    if (!user_id) {
      return res.status(404).json({ error: "User not found" });
    }

    const uid = await User.findById(user_id);

    const user_posts = await Post.find({ user: uid._id }).sort({
      createdAt: -1,
    }).populate({ path: "user", select: "-password" }).populate({ path: "comments.user", select: "-password" });

    //  const posts= await Post.find().sort({
    //    createdAt: -1,
    //  }).populate({path:"user", select: "-password"});

    if (user_posts.length === 0) {
      return res.status(404).json({ error: "No posts found" });
    }

    res.status(200).json(user_posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getLikedPosts = async (req, res) => {
  try {
    const { id: user_id } = req.params;

  

    // Validate if user_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).sort({
      createdAt: -1,
    }).populate({
      path: "user",
      select: "-password",
    }).populate({
      path: "comments.user",
      select: "-password",
    });

    // .populate({
    //   path: "username",
    //   select: "-password",
    // })
    // .populate({
    //   path: "comments.user",
    //   select: "-password",
    // });

   
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const allposts = await Post.find().sort({ createdAt: -1 }).populate({
      path: "user",
      select: "-password",
    }).populate({
      path: "comments.user",
      select: "-password",
    })

    // console.log(allposts);
    res.status(200).json(allposts);
  } catch (error) {

    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    const username = req.cookies.username;
    const user = await User.findOne({ username });
    const following = user.following;


    const followingPosts = await Post.find({ user: { $in: following } }).sort({
      createdAt: -1,
    }).populate({ path: "user", select: "-password" });


    res.status(200).json(followingPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getPosts = async (req, res) => {
  try {
    const { id: post_id } = req.params; 

    if (!post_id) {
      return res.status(404).json({ error: "User not found" });
    } 

    const posts = await Post.findById(post_id).populate({ path: "user", select: "-password" }).populate({ path: "comments.user", select: "-password" });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const loadPosts = async (req, res) => {
  try {
   res.sendFile(path.join(__dirname, "../public/tweet.html"));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createPost,
  removePost,
  likeTogglePost,
  commentPost,
  getUserPosts,
  getLikedPosts,
  getAllPosts,
  getFollowingPosts,
  getPosts,
  loadPosts,

};
