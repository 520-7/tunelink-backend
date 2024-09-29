import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;

export const getFeed = async (req, res) => {
  let client;

  try {
    client = await MongoClient.connect(mongoUri);
    await client.connect();
    const db = client.db("app_data");
    const postsCollection = db.collection("posts");

    const posts = await postsCollection.find().limit(50).toArray();

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
