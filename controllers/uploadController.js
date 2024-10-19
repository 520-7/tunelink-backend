import { MongoClient, GridFSBucket } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

let client;

const DB = "app_data";
const USER_BUCKET = "users";
const MP3_BUCKET = "audio_files";
const USER_AVATAR_BUCKET = "user_avatars";
const POST_BUCKET = "posts";
const POST_IMAGE_BUCKET = "post_images";

const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

/**
 * Uploads a file to GridFS.
 * @param {string} filename - The name of the file.
 * @param {Buffer} buffer - The file data as a Buffer.
 * @returns {Promise<string>} - A promise that resolves with the file ID in GridFS.
 */
export const uploadFileToGridFS = async (filename, buffer, bucketName) => {
  try {
    const client = await getMongoClient();
    const db = client.db(DB);

    const bucket = new GridFSBucket(db, {
      bucketName: bucketName,
    });

    const uploadStream = bucket.openUploadStream(filename);

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

export const uploadPost = async (req, res) => {
  try {
    const { ownerUser, likesCount, timestamp, caption, outLinks } = req.body;

    if (!ownerUser || !timestamp || !caption) {
      return res
        .status(400)
        .json({ message: "Missing required post metadata." });
    }

    const client = await getMongoClient();
    const db = client.db(DB);
    const postsCollection = db.collection(POST_BUCKET);

    let postDocument = {
      ownerUser,
      likesCount: parseInt(likesCount, 10) || 0,
      timestamp: new Date(timestamp),
      albumCoverUrl: "",
      audioUrl: "",
      caption,
      outLinks: outLinks || {},
    };

    // Check if albumCover file is provided and upload it
    if (req.files && req.files.albumCover) {
      postDocument.albumCoverUrl = await uploadFileToGridFS(
        req.files.albumCover.originalname,
        req.files.albumCover.buffer,
        POST_IMAGE_BUCKET
      );
    }

    // Check if audio file is provided and upload it
    if (req.files && req.files.audio) {
      postDocument.audioUrl = await uploadFileToGridFS(
        req.files.audio.originalname,
        req.files.audio.buffer,
        MP3_BUCKET
      );
    }

    // Insert the new post document into the database
    const result = await postsCollection.insertOne(postDocument);

    return res.status(201).json({
      message: "Post created successfully",
      postId: result.insertedId,
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const uploadUser = async (req, res) => {
  try {
    const {
      userName,
      profileName,
      followerCount,
      following,
      totalLikeCount,
      profileDescription,
      genres,
      ownedPosts,
    } = req.body;

    if (!userName || !profileName) {
      return res
        .status(400)
        .json({ message: "userName and profileName are required." });
    }

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const existingUser = await usersCollection.findOne({ userName });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this userName already exists." });
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
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error uploading user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

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
