import { describe, expect, jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// get the mongo uri from the environment variables
const mongoUri = process.env.MONGO_CONNECTION_STRING;
// get the database name from the environment variables
const DB = "app_data";

let client;

// get a mongo client
const getMongoClient = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUri);
  }
  return client;
};

// get the directory name of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// test for signing up and then logging in
describe("Should sign up and then login", () => {
  let users = [];

  // before all tests, get a mongo client and drop the database
  beforeAll(async () => {
    jest.setTimeout(1000000);
    client = await getMongoClient();
    await client.db(DB).dropDatabase();
  });

  it("should sign up new users", async () => {
    // read the users data from the json file
    const usersData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "data", "test_data", "MOCK_USERS.json")
      )
    );

    for (const user of usersData) {
      user["email"] = user["userName"];
      user["password"] = user["userName"] + "pwpw";

      const response = await request(app).post("/auth/signup").send(user);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userId");
      expect(typeof response.body.userId).toBe("string");
      users.push({
        id: response.body.userId,
        email: user["email"],
        password: user["password"],
      });
    }
  }, 100000);

  it("should login with new users", async () => {
    // for each user, login and check the response
    for (const user of users) {
      const email = user["email"];
      const password = user["password"];

      const response = await request(app).post("/auth/login").send({
        email: email,
        password: password,
      });

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(user["id"]);
    }
  }, 100000);

  it("should fail on missing field", async () => {
    // create a bad user with missing fields
    let bad_user = {
      userName: "DOESNOTEXIST",
      profileName: "DOESNOTEXIST",
    };
    // try to sign up the bad user and check the response
    let response = await request(app).post("/auth/signup").send(bad_user);
    expect(response.status).toBe(400);

    // create a bad user with missing fields
    bad_user = {
      email: "DOESNOTEXIST",
    };

    // try to sign up the bad user and check the response
    response = await request(app).post("/auth/signup").send(bad_user);
    expect(response.status).toBe(400);
  }, 100000);

  it("should fail on missing field login", async () => {
    // create a bad user with missing fields
    let bad_user = {
      email: "DOESNOTEXIST",
    };

    // try to login the bad user and check the response
    let response = await request(app).post("/auth/login").send(bad_user);
    expect(response.status).toBe(400);

    // create a bad user with missing fields
    bad_user = {
      password: "DOESNOTEXIST",
    };

    // try to login the bad user and check the response
    response = await request(app).post("/auth/login").send(bad_user);
    expect(response.status).toBe(400);
  }, 100000);
});
