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

// delete a user by id
export const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params; // Assume userId is passed as a URL parameter

    // Convert the string ID to a MongoDB ObjectId
    const id = ObjectId.createFromHexString(userId);

    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    // delete one user by id
    const result = await usersCollection.deleteOne({ _id: id });

    // if the user is not found, return a 404 error
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    // if the user is deleted successfully, return a 200 status and a message
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    // if there is an error, return a 500 status and a message
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserById = async (req, res) => {
  try {
    // parse the user id from the request params
    const { userId } = req.params;
    console.log("USER ID", userId);
    console.log("BODY", req.body);

    // create a mongodb object id from the user id
    const id = ObjectId.createFromHexString(userId);
    // get the update data from the request body
    const updateData = req.body;
    // ensure the _id field is not updated
    delete updateData._id;

    // Parse `genres` field if it's present
    if (updateData.genres) {
      try {
        updateData.genres = JSON.parse(updateData.genres); // Convert it back to an array
      } catch (error) {
        console.error("Failed to parse genres:", error);
        return res.status(400).json({ message: "Invalid genres format." });
      }
    }

    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    // handle user avatar update
    let userAvatarUrl = "";
    console.log("File received:", req.file);

    // if a file is received, update the user avatar
    if (req.file) {
      console.log("avatar being updated");
      userAvatarUrl = await uploadFileToGridFS(
        req.file.originalname,
        req.file.buffer,
        USER_AVATAR_BUCKET
      );
    }

    // if the user avatar url is updated, update the user avatar url in the update data
    if (userAvatarUrl) {
      updateData.userAvatarUrl = userAvatarUrl;
    }

    // update the user in the database
    const result = await usersCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    // if the user is not found, return a 404 error
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // if the user is updated successfully, return a 200 status and a message
    return res
      .status(200)
      .json({ message: "User updated successfully.", userAvatarUrl });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// read a user by id
export const readUserById = async (req, res) => {
  try {
    // parse the user id from the request params
    const { userId } = req.params;
    // create a mongodb object id from the user id
    const id = ObjectId.createFromHexString(userId);
    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    // read one user by id
    const user = await usersCollection.findOne({ _id: id });

    // if the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // if the user is found, return a 200 status and the user
    return res.status(200).json(user);
  } catch (error) {
    // if there is an error, return a 500 status and a message
    console.error("Error reading user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// read a user by email
export const readUserByEmail = async (req, res) => {
  try {
    // parse the email from the request query
    const { email } = req.query;

    // if the email is not provided, return a 400 error
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    // read one user by email
    const user = await usersCollection.findOne({ email });

    // if the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // if the user is found, return a 200 status and the user
    return res.status(200).json(user);
  } catch (error) {
    // if there is an error, return a 500 status and a message
    console.error("Error reading user by email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const findUserByEmail = async (email) => {
  try {
    // if the email is not provided, throw an error
    if (!email) throw new Error("Email is required.");

    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    // read one user by email
    const user = await usersCollection.findOne({ email });
    return user;
  } catch (error) {
    // if there is an error, throw an error
    console.error("Error finding user by email:", error);
    throw new Error("Internal Server Error");
  }
};

// read a user by username
export const readUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // if the username is not provided, return a 400 error
    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const user = await usersCollection.findOne({ userName: username });

    // if the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    // if there is an error, return a 500 status and a message
    console.error("Error reading user by username:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// read a user by email
export const findUserByEmailEndpoint = async (req, res) => {
  try {
    const { email } = req.params;

    // if the email is not provided, return a 400 error
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // get the mongo client
    const client = await getMongoClient();
    const db = client.db(DB);
    const usersCollection = db.collection(USER_BUCKET);

    const user = await usersCollection.findOne({ email });

    // if the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // if the user is found, return a 200 status and the user
    return res.status(200).json(user);
  } catch (error) {
    // if there is an error, return a 500 status and a message
    console.error("Error finding user by email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// fetch users by genre
export const fetchUsersByField = async (req, res) => {
  try {
    // log the query params received
    console.log("Query params received:", req.params);
    const { genre } = req.params;

    // if the genre is not provided, return a 400 error
    if (!genre) {
      console.log("Genre missing in request.");
      return res.status(400).json({ message: "Genre is required." });
    }

    // get the mongo client
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

    // shuffle the users
    const shuffledUsers = users.sort(() => 0.5 - Math.random());
    // select 5 random users
    const selectedUsers = shuffledUsers.slice(0, 5);
    // sanitize the users by removing the password and email fields
    const sanitizedUsers = selectedUsers.map((user) => {
      const { password, email, ...sanitizedUser } = user;
      return sanitizedUser;
    });
    // return the sanitized users
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error("Error in fetchUsersByField:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
