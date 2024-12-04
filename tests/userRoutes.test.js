import { expect, jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { response } from "express";

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

// test for uploading users and performing CRUD operations on them
describe("Upload users and Perform CRUD", () => {
  let userIds = [];

  // erases all prior test data
  beforeAll(async () => {
    jest.setTimeout(1000000);
    client = await getMongoClient();
    await client.db(DB).dropDatabase();
  });

  // test for uploading all users and returning their userIds
  it("should upload all users and return their userIds", async () => {
    const genres = [
      "Metal",
      "Rock",
      "HipHop",
      "Jazz",
      "Soul",
      "Country",
      "EDM",
    ];

    const usersData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "data", "test_data", "MOCK_USERS.json")
      )
    );
    for (const user of usersData) {
      user["email"] = user["userName"];
      const genreCount = Math.floor(Math.random() * genres.length) + 1;
      user.genres = [];
      for (let i = 0; i < genreCount; i++) {
        const randomIndex = Math.floor(Math.random() * genres.length);
        if (!user.genres.includes(genres[randomIndex])) {
          user.genres.push(genres[randomIndex]);
        }
      }

      const response = await request(app)
        .post("/api/upload/uploadUser")
        .send(user);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userId");
      expect(typeof response.body.userId).toBe("string");
      userIds.push(response.body.userId);
    }
  }, 100000);

  // test for getting all users
  it("should GET all users", async () => {
    for (const userId of userIds) {
      const response = await request(app).get(`/api/user/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(userId);
    }
  }, 1000000);

  // test for searching for users by genre
  it("should search for users by genre", async () => {
    const genres = [
      "Metal",
      "Rock",
      "HipHop",
      "Jazz",
      "Soul",
      "Country",
      "EDM",
    ];

    for (const genre of genres) {
      const response = await request(app)
        .get(`/api/user/search-by-genre/${genre}`)
        .expect("Content-Type", /json/)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0); // might fail very rarely, depends on random
    }
  }, 1000000);

  // test for updating all users
  it("should PUT all users", async () => {
    for (const userId of userIds) {
      const responseFromPut = await request(app)
        .put(`/api/user/${userId}`)
        .set("Content-Type", "application/json")
        .send({ profileName: "Kirk Hammet" });
      expect(responseFromPut.status).toBe(200);

      const responseFromGet = await request(app).get(`/api/user/${userId}`);
      expect(responseFromGet.status).toBe(200);
      expect(responseFromGet.body.profileName).toBe("Kirk Hammet");
    }
  }, 1000000);

  // test for deleting all users
  it("should DELETE all users", async () => {
    for (const userId of userIds) {
      const response = await request(app).delete(`/api/user/${userId}`);
      expect(response.status).toBe(200);

      const responseFromGet = await request(app).get(`/api/user/${userId}`);
      expect(responseFromGet.status).toBe(404);
    }
  }, 1000000);

  // don't do tests after deleting all users
});
