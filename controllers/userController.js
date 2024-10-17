import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;

let client;

const DB = "app_data";
const USER_BUCKET = "users";

const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

import { ObjectId } from "mongodb";

export const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params; // Assume userId is passed as a URL parameter

    // Convert the string ID to a MongoDB ObjectId
    const id = ObjectId.createFromHexString(userId);

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const result = await usersCollection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    // Handle the error if the ObjectId was not valid
    if (error instanceof Error && error.name === "BSONTypeError") {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const id = ObjectId.createFromHexString(userId);
    const updateData = req.body;

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const result = await usersCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const readUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const id = ObjectId.createFromHexString(userId);

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const user = await usersCollection.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error reading user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
