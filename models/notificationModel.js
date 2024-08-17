const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
     from: {
       type: mongoose.Schema.Types.ObjectId,
       required: true,
       ref: "User",
     },
     to: {
       type: mongoose.Schema.Types.ObjectId,
       required: true,
       ref: "User",
     },
     type: {
       type: String,
       required: true,
       enum: ["follow", "like","comment"],
     },
     read: {
       type: Boolean,
       default: false,
     },
     pid: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Post",
       default: null,
     },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
