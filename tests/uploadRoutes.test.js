import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_CONNECTION_STRING;
const DB = "app_data";

let client;

const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Music Sharing App Upload Endpoints", () => {
  let userIds = [];

  // erases all prior test data
  beforeAll(async () => {
    jest.setTimeout(1000000);
    client = await getMongoClient();
    await client.db(DB).dropDatabase();
  });

  afterAll(() => {
    if (client) {
      client.close();
    }
  });

  it("should upload all users and return their userIds", async () => {
    const usersData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "data", "test_data", "MOCK_USERS.json")
      )
    );
    for (const user of usersData) {
      const response = await request(app)
        .post("/api/upload/uploadUser")
        .send(user);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userId");
      userIds.push(response.body.userId);
    }
  }, 100000);

  it("should upload two posts for each user", async () => {
    const postsData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "data", "test_data", "MOCK_POSTS.json")
      )
    );
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const firstPost = { ...postsData[i * 2], ownerUser: userId };
      const secondPost = { ...postsData[i * 2 + 1], ownerUser: userId };

      const responseFirstPost = await request(app)
        .post("/api/upload/uploadPost")
        .send(firstPost);
      expect(responseFirstPost.status).toBe(201);

      const responseSecondPost = await request(app)
        .post("/api/upload/uploadPost")
        .send(secondPost);
      expect(responseSecondPost.status).toBe(201);
    }
  }, 100000);
});
