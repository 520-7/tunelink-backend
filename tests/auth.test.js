import { describe, expect, jest } from "@jest/globals";
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

describe("Should sign up and then login", () => {
  let users = [];

  beforeAll(async () => {
    jest.setTimeout(1000000);
    client = await getMongoClient();
    await client.db(DB).dropDatabase();
  });

  it("should sign up new users", async () => {
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
    let bad_user = {
      userName: "DOESNOTEXIST",
      profileName: "DOESNOTEXIST",
    };

    let response = await request(app).post("/auth/signup").send(bad_user);
    expect(response.status).toBe(400);

    bad_user = {
      email: "DOESNOTEXIST",
    };

    response = await request(app).post("/auth/signup").send(bad_user);
    expect(response.status).toBe(400);
  }, 100000);

  it("should fail on missing field login", async () => {
    let bad_user = {
      email: "DOESNOTEXIST",
    };

    let response = await request(app).post("/auth/login").send(bad_user);
    expect(response.status).toBe(400);

    bad_user = {
      password: "DOESNOTEXIST",
    };

    response = await request(app).post("/auth/login").send(bad_user);
    expect(response.status).toBe(400);
  }, 100000);
});
