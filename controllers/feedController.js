import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { getMongoClient } from "./mongo.js";

dotenv.config();

// const mongoUri = process.env.MONGO_CONNECTION_STRING;

// let client;

// const getMongoClient = async () => {
//   if (!client) {
//     client = await MongoClient.connect(mongoUri);
//   }
//   return client;
// };

export const getFeedPost = async (req, res) => {
  try {
    const { userId } = req.params;
    client = await getMongoClient();
    const db = client.db("app_data");
    const usersCollection = db.collection("users");
    const postsCollection = db.collection("posts");

    const objId = ObjectId.createFromHexString(userId);

    const user = await usersCollection.findOne({ _id: objId });
    const following = user.following;

    let query;
    const randomPercentage = Math.random() * 100;

    if (randomPercentage <= 80) {
      query = {
        ownerUser: { $in: following },
      };
    } else {
      query = {
        ownerUser: { $nin: following },
      };
    }

    const post = await getRandomPost(postsCollection, query);

    res.json(post);
  } catch (error) {
    console.error("Failed to get feed post:", error);
    res.status(500).send("Internal Server Error");
  }
};

async function getRandomPost(collection, query) {
  const posts = await collection.find(query).toArray();
  const randomIndex = Math.floor(Math.random() * posts.length);
  return posts[randomIndex];
}

export const getFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    client = await getMongoClient();
    const db = client.db("app_data");
    const postsCollection = db.collection("posts");

    const posts = await postsCollection
      .find()
      .sort({ timestamp: -1 }) // Sort by 'timestamp' field in descending order to get the most recent posts first
      .limit(50) // Limit to 50 posts
      .toArray();

    res.json({ feed: posts });
  } catch (error) {
    console.error("Error in /get_feed:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
