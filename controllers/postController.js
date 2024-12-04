import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { getMongoClient } from "./mongo.js";

dotenv.config();

// const mongoUri = process.env.MONGO_CONNECTION_STRING;

// let client;

const DB = "app_data";
const MP3_BUCKET = "audio_files";
const POST_BUCKET = "posts";
const POST_IMAGE_BUCKET = "post_images";

// const getMongoClient = async () => {
//   if (!client) {
//     client = await MongoClient.connect(mongoUri);
//   }
//   return client;
// };

// get a post by id
export const getPostById = async (req, res) => {
  try {
    // get the post id from the request params
    const { postId } = req.params;
    // create an object id from the post id
    const id = ObjectId.createFromHexString(postId);
    // get the mongo client
    const client = await getMongoClient();
    // get the database
    const db = client.db(DB);
    // get the posts collection
    const postsCollection = db.collection(POST_BUCKET);
    // find the post by id
    const post = await postsCollection.findOne({ _id: id });

    // if the post is not found, return a 404 error
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // if the post is found, return a 200 status and the post
    return res.status(200).json(post);
  } catch (error) {
    // if there is an error, return a 500 status and a message
    console.error("Error reading post:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePostById = async (req, res) => {
  // You should only update likesCount usually, will be handled in frontend
  try {
    // get the post id from the request params
    const { postId } = req.params;
    const updateData = req.body;
    const id = ObjectId.createFromHexString(postId);
    const client = await getMongoClient();
    const db = client.db(DB);
    const postsCollection = db.collection(POST_BUCKET);

    // filter the update data to only update likesCount
    const filteredUpdateData = {
      likesCount: updateData.likesCount,
    }; // Only update likesCount

    // update the post
    const updateResult = await postsCollection.updateOne(
      { _id: id },
      { $set: filteredUpdateData }
    );

    // if the post is not found, return a 404 error
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // if the post is updated successfully, return a 200 status and a message
    if (updateResult.modifiedCount === 1) {
      return res.status(200).json({ message: "Post updated successfully" });
    }

    return res.status(500).json({ message: "Failed to update the post" });
  } catch (error) {
    // if there is an error, return a 500 status and a message
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// delete a post by id
export const deletePostById = async (req, res) => {
  try {
    // get the post id from the request params
    const { postId } = req.params;
    // create an object id from the post id
    const id = ObjectId.createFromHexString(postId);
    // get the mongo client
    const client = await getMongoClient();
    // get the database
    const db = client.db(DB);
    // get the posts collection
    const postsCollection = db.collection(POST_BUCKET);
    // find the post by id
    const post = await postsCollection.findOne({ _id: id });

    // if the post is not found, return a 404 error
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // create a gridfs bucket for the post images
    const imageBucket = new GridFSBucket(db, { bucketName: POST_IMAGE_BUCKET });
    // create a gridfs bucket for the audio files
    const audioBucket = new GridFSBucket(db, {
      bucketName: MP3_BUCKET,
    });

    // if the post has an album cover, delete the album cover
    if (post.albumCoverUrl) {
      const albumCoverId = ObjectId.createFromHexString(post.albumCoverUrl);
      await imageBucket.delete(albumCoverId);
    }

    // if the post has an audio file, delete the audio file
    if (post.audioUrl) {
      const audioId = ObjectId.createFromHexString(post.audioUrl);
      await audioBucket.delete(audioId);
    }

    // delete the post
    const result = await postsCollection.deleteOne({ _id: id });

    // if the post is deleted successfully, return a 200 status and a message
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Post deleted successfully." });
    } else {
      res.status(404).json({ message: "Post not found." });
    }
  } catch (error) {
    // if there is an error, return a 500 status and a message
    res.status(500).json({ message: error.message });
  }
};
