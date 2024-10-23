import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;

let client;

const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

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
  } finally {
    if (client) {
      await client.close();
    }
  }
};
