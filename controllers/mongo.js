import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;

let client;

// get the mongo client
export const getMongoClient = async () => {
  // if the client is not already connected, connect to the mongo server
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  // return the client
  // client is a singleton, shared across services
  return client;
};
