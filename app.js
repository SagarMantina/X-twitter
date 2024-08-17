const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const fs = require('fs');
const cookie_parser= require('cookie-parser');
const app = express();
const cloudinary = require('cloudinary').v2;


const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

const connectMongoDb = require("./controllers/connectMongo");

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,     
});



const PORT = process.env.PORT || 3000;


app.use(cookie_parser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", postRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectMongoDb(); // Connect to MongoDB
});

