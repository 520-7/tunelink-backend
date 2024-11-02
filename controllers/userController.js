import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { uploadFileToGridFS } from "./uploadController.js";
import { ObjectId } from "mongodb";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;

let client;

const DB = "app_data";
const USER_BUCKET = "users";
const USER_AVATAR_BUCKET = "user_avatars";

const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

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
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const id = ObjectId.createFromHexString(userId);
    const updateData = req.body;
    delete updateData._id; // Ensure the _id field is not updated

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    // Check if a userAvatar file is included in the request and upload it
    let userAvatarUrl;
    if (req.file) {
      userAvatarUrl = await uploadFileToGridFS(
        req.file.originalname,
        req.file.buffer,
        USER_AVATAR_BUCKET
      );
    }

    if (userAvatarUrl) {
      updateData.userAvatarUrl = userAvatarUrl;
    }

    const result = await usersCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully.", userAvatarUrl });
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
