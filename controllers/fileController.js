import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";
import { getMongoClient } from "./mongo.js";

const DB = "app_data";
const MP3_BUCKET = "audio_files";
const POST_IMAGE_BUCKET = "post_images";
const USER_AVATAR_BUCKET = "user_avatars";

const streamFileToResponse = (bucket, fileId, res, contentType) => {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(
      ObjectId.createFromHexString(fileId)
    );

    res.setHeader("Content-Type", contentType);
    downloadStream.pipe(res);

    downloadStream.on("error", (error) => {
      res.status(404).send(`${fileId} File not found`);
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
