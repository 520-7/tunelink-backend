import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { getMongoClient } from "./mongo.js";

dotenv.config();

// const mongoUri = process.env.MONGO_CONNECTION_STRING;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// let client;

const DB = "app_data";
const USER_BUCKET = "users";
const MP3_BUCKET = "audio_files";
const USER_AVATAR_BUCKET = "user_avatars";
const POST_BUCKET = "posts";
const POST_IMAGE_BUCKET = "post_images";

// const getMongoClient = async () => {
//   if (!client) {
//     client = await MongoClient.connect(mongoUri);
//   }
//   return client;
// };

/**
 * Uploads a file to GridFS.
 * @param {string} filename - The name of the file.
 * @param {Buffer} buffer - The file data as a Buffer.
 * @returns {Promise<string>} - A promise that resolves with the file ID in GridFS.
 */
export const uploadFileToGridFS = async (filename, buffer, bucketName) => {
  try {
    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);

    // create a gridfs bucket
    const bucket = new GridFSBucket(db, {
      bucketName: bucketName,
    });

    // create an upload stream
    const uploadStream = bucket.openUploadStream(filename);

    // return a promise that resolves with the file ID in GridFS
    return new Promise((resolve, reject) => {
      uploadStream.end(buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(uploadStream.id.toString()); // Convert the file ID to a string
        }
      });
    });
  } catch (error) {
    console.error("Error uploading file to GridFS:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// upload a post
export const uploadPost = async (req, res) => {
  try {
    const { ownerUser, likesCount, caption, outLinks } = req.body;

    // if the owner user or caption is not provided, return a 400 error
    if (!ownerUser || !caption) {
      return res
        .status(400)
        .json({ message: "Missing required post metadata." });
    }

    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const postsCollection = db.collection(POST_BUCKET);
    const usersCollection = db.collection(USER_BUCKET);

    let postDocument = {
      // ownerUser: ObjectId.createFromHexString(ownerUser),
      ownerUser,
      likesCount: parseInt(likesCount, 10) || 0,
      timestamp: new Date(),
      albumCoverUrl: "",
      audioUrl: "",
      caption,
      outLinks: outLinks || [],
    };

    // log the request body and files
    // console.log(req.body);
    // console.log(req.files);

    // check if the album cover file is provided and upload it
    if (req.files && req.files.albumCover) {
      postDocument.albumCoverUrl = await uploadFileToGridFS(
        req.files.albumCover[0].originalname,
        req.files.albumCover[0].buffer,
        POST_IMAGE_BUCKET
      );
    }

    // check if the audio file is provided and upload it
    if (req.files && req.files.audio) {
      postDocument.audioUrl = await uploadFileToGridFS(
        req.files.audio[0].originalname,
        req.files.audio[0].buffer,
        MP3_BUCKET
      );
    }

    // insert the post into the database
    const result = await postsCollection.insertOne(postDocument);

    // get the post id
    const postId = result.insertedId;

    // update the user's owned posts with the new post id
    const updateResult = await usersCollection.updateOne(
      { _id: ObjectId.createFromHexString(ownerUser) },
      { $push: { ownedPosts: postId } }
    );

    // if the user is not found, return a 404 error
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // if the post is created successfully, return a 201 status and a message
    return res.status(201).json({
      message: "Post created successfully",
      postId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// upload a user
export const uploadUser = async (req, res) => {
  try {
    const {
      email,
      password,
      userName,
      profileName,
      followerCount,
      following,
      totalLikeCount,
      profileDescription,
      genres,
      ownedPosts,
    } = req.body;

    // if the user name or profile name is not provided, return a 400 error
    if (!userName || !profileName) {
      return res
        .status(400)
        .json({ message: "userName and profileName are required." });
    }

    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const existingUser = await usersCollection.findOne({
      $or: [{ userName }, { email }],
    });

    // if the user already exists, return a 409 error
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this userName already exists." });
    }

    let userAvatarUrl = "";
    // check if the user avatar file is provided and upload it
    if (req.file) {
      userAvatarUrl = await uploadFileToGridFS(
        req.file.originalname,
        req.file.buffer,
        USER_AVATAR_BUCKET
      );
    }

    // create the user document
    const newUser = {
      email,
      password,
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

    // insert the user into the database
    const result = await usersCollection.insertOne(newUser);

    // if the user is created successfully, return a 201 status and a message
    return res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error uploading user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// upload an MP3 file
export const uploadMP3File = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "File size exceeds the limit." });
    }

    // Use the uploadFileToGridFS function to upload the MP3 file
    const fileId = await uploadFileToGridFS(
      req.file.originalname,
      req.file.buffer,
      MP3_BUCKET
    );

    // if the file is uploaded successfully, return a 200 status and a message
    res.status(200).json({ message: "File uploaded successfully.", fileId });
  } catch (error) {
    console.error("Error in /upload:", error);
    res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
};

// Graceful shutdown function
export const closeMongoConnection = async () => {
  if (client) {
    await client.close();
    client = null;
  }
};
