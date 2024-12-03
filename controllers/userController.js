import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { uploadFileToGridFS } from "./uploadController.js";
import { ObjectId } from "mongodb";
import { getMongoClient } from "./mongo.js";
import multer from "multer";

dotenv.config();

// const mongoUri = process.env.MONGO_CONNECTION_STRING;

// let client;

const DB = "app_data";
const USER_BUCKET = "users";
const USER_AVATAR_BUCKET = "user_avatars";
const storage = multer.memoryStorage();

// const getMongoClient = async () => {
//   if (!client) {
//     client = await MongoClient.connect(mongoUri);
//   }
//   return client;
// };

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
    console.log("USER ID", userId);
    console.log("BODY", req.body);

    const id = ObjectId.createFromHexString(userId);
    const updateData = req.body;
    delete updateData._id; // Ensure the _id field is not updated

    // Parse `genres` field if it's present
    if (updateData.genres) {
      try {
        updateData.genres = JSON.parse(updateData.genres); // Convert it back to an array
      } catch (error) {
        console.error("Failed to parse genres:", error);
        return res.status(400).json({ message: "Invalid genres format." });
      }
    }

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    // Handle user avatar update
    let userAvatarUrl = "";
    console.log("File received:", req.file);

    if (req.file) {
      console.log("avatar being updated");
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

export const readUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error reading user by email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const findUserByEmail = async (email) => {
  try {
    if (!email) throw new Error("Email is required.");

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const user = await usersCollection.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new Error("Internal Server Error");
  }
};

export const readUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const user = await usersCollection.findOne({ userName: username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error reading user by username:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const findUserByEmailEndpoint = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user by email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchUsersByField = async (req, res) => {
  try {
    console.log("Query params received:", req.params);
    const { genre } = req.params;

    if (!genre) {
      console.log("Genre missing in request.");
      return res.status(400).json({ message: "Genre is required." });
    }

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const users = await usersCollection
      .find({ genres: { $regex: new RegExp(genre, "i") } })
      .toArray();
    // console.log("Users found for genre:", users); too long
    // It is ok to return an empty array if no users are found for the genre
    // if (users.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No users found for this genre." });
    // }

    const shuffledUsers = users.sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(0, 5);
    const sanitizedUsers = selectedUsers.map((user) => {
      const { password, email, ...sanitizedUser } = user;
      return sanitizedUser;
    });
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error("Error in fetchUsersByField:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
