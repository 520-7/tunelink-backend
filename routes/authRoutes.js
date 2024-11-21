import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadFileToGridFS } from "../controllers/uploadController.js";
import { findUserByEmail } from "../controllers/userController.js";
import { getMongoClient } from "../controllers/mongo.js";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const DB = "app_data";
const USER_BUCKET = "users";
const MP3_BUCKET = "audio_files";
const USER_AVATAR_BUCKET = "user_avatars";
const POST_BUCKET = "posts";
const POST_IMAGE_BUCKET = "post_images";

const router = express.Router();

router.post("/signup", upload.single("userAvatar"), async (req, res) => {
  try {
    const {
      email,
      password,
      userName,
      profileName,
      profileDescription,
      followerCount,
      following,
      totalLikeCount,
      genres,
      ownedPosts,
    } = req.body;

    // console.log(JSON.stringify(req.body));

    if (!email || !password || !userName || !profileName) {
      return res.status(400).json({
        message: "Email, password, userName, and profileName are required.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const existingUser = await usersCollection.findOne({
      $or: [{ userName }, { email }],
    });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this userName or email already exists.",
      });
    }

    let userAvatarUrl = "";
    if (req.file) {
      userAvatarUrl = await uploadFileToGridFS(
        req.file.originalname,
        req.file.buffer,
        USER_AVATAR_BUCKET
      );
    }

    const newUser = {
      email,
      password: hashedPassword,
      userAvatarUrl,
      userName,
      profileName,
      followerCount: followerCount || 0,
      following: following || [],
      totalLikeCount: totalLikeCount || 0,
      profileDescription: profileDescription || "",
      genres: genres || [],
      ownedPosts: ownedPosts || [],
    };

    const result = await usersCollection.insertOne(newUser);

    return res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    return res.status(200).json({
      message: "Login successful",
      userId: user._id.toString(),
      userName: user.userName,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;

// import express from "express"
// const router = express.Router();

// router.post('/login', authController.login);
