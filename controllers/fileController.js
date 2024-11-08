import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;

let client;

const DB = "app_data";
const MP3_BUCKET = "audio_files";
const POST_IMAGE_BUCKET = "post_images";
const USER_AVATAR_BUCKET = "user_avatars";

const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

const streamFileToResponse = (bucket, fileId, res, contentType) => {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(
      ObjectId.createFromHexString(fileId)
    );

    res.setHeader("Content-Type", contentType);
    downloadStream.pipe(res);

    downloadStream.on("error", (error) => {
      res.status(404).send("File not found");
      reject(error);
    });

    downloadStream.on("end", () => {
      resolve();
    });
  });
};
export const getUserAvatar = async (req, res) => {
  try {
    const { fileId } = req.params;
    const client = await getMongoClient();
    const db = client.db(DB);
    const bucket = new GridFSBucket(db, { bucketName: USER_AVATAR_BUCKET });
    await streamFileToResponse(bucket, fileId, res, "image/jpeg");
  } catch (error) {
    console.error("Error getting user avatar:", error);
    res.status(500).send("Internal server error");
  }
};

export const getAlbumCover = async (req, res) => {
  try {
    const { fileId } = req.params;
    const client = await getMongoClient();
    const db = client.db(DB);
    const bucket = new GridFSBucket(db, { bucketName: POST_IMAGE_BUCKET });
    await streamFileToResponse(bucket, fileId, res, "image/jpeg");
  } catch (error) {
    console.error("Error getting album cover:", error);
    res.status(500).send("Internal server error");
  }
};

export const getAudio = async (req, res) => {
  try {
    const { fileId } = req.params;
    const client = await getMongoClient();
    const db = client.db(DB);
    const bucket = new GridFSBucket(db, { bucketName: MP3_BUCKET });
    await streamFileToResponse(bucket, fileId, res, "audio/mpeg");
  } catch (error) {
    console.error("Error getting audio file:", error);
    res.status(500).send("Internal server error");
  }
};
