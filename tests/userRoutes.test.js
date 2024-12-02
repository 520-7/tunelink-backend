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

describe("Upload users and Perform CRUD", () => {
  let userIds = [];

  // erases all prior test data
  beforeAll(async () => {
    jest.setTimeout(1000000);
    client = await getMongoClient();
    await client.db(DB).dropDatabase();
  });

  it("should upload all users and return their userIds", async () => {
    const usersData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "data", "test_data", "MOCK_USERS.json")
      )
    );
    for (const user of usersData) {
      user["email"] = user["userName"];
      const response = await request(app)
        .post("/api/upload/uploadUser")
        .send(user);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userId");
      expect(typeof response.body.userId).toBe("string");
      userIds.push(response.body.userId);
    }
  }, 100000);

  it("should GET all users", async () => {
    for (const userId of userIds) {
      const response = await request(app).get(`/api/user/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(userId);
    }
  }, 1000000);

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

  it("should DELETE all users", async () => {
    for (const userId of userIds) {
      const response = await request(app).delete(`/api/user/${userId}`);
      expect(response.status).toBe(200);

      const responseFromGet = await request(app).get(`/api/user/${userId}`);
      expect(responseFromGet.status).toBe(404);
    }
  }, 1000000);

it("should search for users by genre", async () => {
  // Assuming that at least one user has the genre "rock"
  const response = await request(app)
    .get("/api/user/search-by-genre?genre=Rock")
    .expect("Content-Type", /json/)
    .expect(200);

  // Check that the response contains an array of users
  expect(Array.isArray(response.body)).toBe(true);
  
  // If you have specific expectations about the returned users, you can add more assertions here
  // For example:
  // expect(response.body.length).toBeGreaterThan(0); // Ensure at least one user is returned
}, 1000000);
});