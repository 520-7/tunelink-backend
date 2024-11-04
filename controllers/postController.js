import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;

let client;

const DB = "app_data";
const MP3_BUCKET = "audio_files";
const POST_BUCKET = "posts";
const POST_IMAGE_BUCKET = "post_images";

const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const id = ObjectId.createFromHexString(postId);
    const client = await getMongoClient();
    const db = client.db(DB);
    const postsCollection = db.collection(POST_BUCKET);
    const post = await postsCollection.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error reading post:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePostById = async (req, res) => {
  // You should only update likesCount usually, will be handled in frontend
  try {
    const { postId } = req.params;
    const updateData = req.body;
    const id = ObjectId.createFromHexString(postId);
    const client = await getMongoClient();
    const db = client.db(DB);
    const postsCollection = db.collection(POST_BUCKET);

    const filteredUpdateData = {
      likesCount: updateData.likesCount,
    }; // Only update likesCount

    const updateResult = await postsCollection.updateOne(
      { _id: id },
      { $set: filteredUpdateData }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (updateResult.modifiedCount === 1) {
      return res.status(200).json({ message: "Post updated successfully" });
    }

    return res.status(500).json({ message: "Failed to update the post" });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const id = ObjectId.createFromHexString(postId);
    const client = await getMongoClient();
    const db = client.db(DB);
    const postsCollection = db.collection(POST_BUCKET);
    const post = await postsCollection.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const imageBucket = new GridFSBucket(db, { bucketName: POST_IMAGE_BUCKET });
    const audioBucket = new GridFSBucket(db, {
      bucketName: MP3_BUCKET,
    });

    if (post.albumCoverUrl) {
      const albumCoverId = ObjectId.createFromHexString(post.albumCoverUrl);
      await imageBucket.delete(albumCoverId);
    }

    if (post.audioUrl) {
      const audioId = ObjectId.createFromHexString(post.audioUrl);
      await audioBucket.delete(audioId);
    }

    const result = await postsCollection.deleteOne({ _id: id });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Post deleted successfully." });
    } else {
      res.status(404).json({ message: "Post not found." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
