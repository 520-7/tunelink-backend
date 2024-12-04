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

// stream a file to the response
const streamFileToResponse = (bucket, fileId, res, contentType) => {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(
      ObjectId.createFromHexString(fileId)
    );

    // set the content type header
    res.setHeader("Content-Type", contentType);

    // pipe the download stream to the response
    downloadStream.pipe(res);

    // if there is an error, return a 404 error
    downloadStream.on("error", (error) => {
      res.status(404).send(`${fileId} File not found`);
      reject(error);
    });

    // if the download stream ends, resolve the promise
    downloadStream.on("end", () => {
      resolve();
    });
  });
};

// get a user avatar by file id
export const getUserAvatar = async (req, res) => {
  try {
    // get the file id from the request params
    const { fileId } = req.params;
    // get the mongo client
    const client = await getMongoClient();
    // get the database
    const db = client.db(DB);
    // create a gridfs bucket for the user avatars
    const bucket = new GridFSBucket(db, { bucketName: USER_AVATAR_BUCKET });
    // stream the file to the response
    await streamFileToResponse(bucket, fileId, res, "image/jpeg");
  } catch (error) {
    console.error("Error getting user avatar:", error);
    res.status(500).send("Internal server error");
  }
};

// get an album cover by file id
export const getAlbumCover = async (req, res) => {
  try {
    // get the file id from the request params
    const { fileId } = req.params;
    // get the mongo client
    const client = await getMongoClient();
    // get the database
    const db = client.db(DB);
    // create a gridfs bucket for the post images
    const bucket = new GridFSBucket(db, { bucketName: POST_IMAGE_BUCKET });
    // stream the file to the response
    await streamFileToResponse(bucket, fileId, res, "image/jpeg");
  } catch (error) {
    console.error("Error getting album cover:", error);
    res.status(500).send("Internal server error");
  }
};

// get an audio file by file id
export const getAudio = async (req, res) => {
  try {
    // get the file id from the request params
    const { fileId } = req.params;
    // get the mongo client
    const client = await getMongoClient();
    // get the database
    const db = client.db(DB);
    // create a gridfs bucket for the audio files
    const bucket = new GridFSBucket(db, { bucketName: MP3_BUCKET });
    // stream the file to the response
    await streamFileToResponse(bucket, fileId, res, "audio/mpeg");
  } catch (error) {
    console.error("Error getting audio file:", error);
    res.status(500).send("Internal server error");
  }
};
