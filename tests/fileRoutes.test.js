import { expect, it, jest } from "@jest/globals";
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

describe("Upload users and posts, and perform GET on Files", () => {
  let userIds = [];
  let postIds = [];

  // erases all prior test data
  beforeAll(async () => {
    jest.setTimeout(1000000);
    client = await getMongoClient();
    await client.db(DB).dropDatabase();
  });

  it("should upload all users and return their userIds (assign random avatar with probability)", async () => {
    const usersData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "data", "test_data", "MOCK_USERS.json")
      )
    );

    const avatarDir = path.join(
      __dirname,
      "..",
      "data",
      "test_data",
      "test_userAvatar"
    );

    const avatarFiles = fs.readdirSync(avatarDir);

    for (const user of usersData) {
      const shouldAttachAvatar = Math.random() < 0.8;
      const avatarIndex = Math.floor(Math.random() * avatarFiles.length);
      const avatarPath = path.join(avatarDir, avatarFiles[avatarIndex]);

      const response = await request(app)
        .post("/api/upload/uploadUser")
        .field("user", JSON.stringify(user))
        .attach("userAvatar", avatarPath);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userId");
      userIds.push(response.body.userId);
    }
  }, 100000);

  it("should upload two posts for each user and update ownedPosts (assign random audio and albumCover)", async () => {
    const postsData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "data", "test_data", "MOCK_POSTS.json")
      )
    );

    const audioDir = path.join(
      __dirname,
      "..",
      "data",
      "test_data",
      "test_audio"
    );
    const albumCoverDir = path.join(
      __dirname,
      "..",
      "data",
      "test_data",
      "test_albumCover"
    );

    const audioFiles = fs.readdirSync(audioDir);
    const albumCoverFiles = fs.readdirSync(albumCoverDir);

    for (let i = 0; i < userIds.length; i++) {
      let shouldAttachAlbumCover = Math.random() < 0.8;
      let albumCoverIndex = Math.floor(Math.random() * albumCoverFiles.length);
      let albumCoverPath = path.join(
        albumCoverDir,
        albumCoverFiles[albumCoverIndex]
      );

      let audioIndex = Math.floor(Math.random() * audioFiles.length);
      let audioPath = path.join(audioDir, audioFiles[audioIndex]);

      const userId = userIds[i];
      const firstPost = { ...postsData[i * 2], ownerUser: userId };
      const secondPost = { ...postsData[i * 2 + 1], ownerUser: userId };

      const responseFirstPost = await request(app)
        .post("/api/upload/uploadPost")
        .field("ownerUser", firstPost.ownerUser)
        .field("likesCount", 0)
        .field("timestamp", firstPost.timestamp)
        .field("caption", firstPost.caption)
        .field("outLinks", JSON.stringify(firstPost.outLinks))
        .attach("albumCover", albumCoverPath)
        .attach("audio", audioPath);
      expect(responseFirstPost.status).toBe(201);
      const firstPostId = responseFirstPost.body.postId;

      // Second post case has different settings
      shouldAttachAlbumCover = Math.random() < 0.8;
      albumCoverIndex = Math.floor(Math.random() * albumCoverFiles.length);
      albumCoverPath = path.join(
        albumCoverDir,
        albumCoverFiles[albumCoverIndex]
      );

      audioIndex = Math.floor(Math.random() * audioFiles.length);
      audioPath = path.join(audioDir, audioFiles[audioIndex]);

      const responseSecondPost = await request(app)
        .post("/api/upload/uploadPost")
        .field("ownerUser", secondPost.ownerUser)
        .field("likesCount", 0)
        .field("timestamp", secondPost.timestamp)
        .field("caption", secondPost.caption)
        .field("outLinks", JSON.stringify(secondPost.outLinks))
        .attach("albumCover", albumCoverPath)
        .attach("audio", audioPath);
      expect(responseSecondPost.status).toBe(201);
      const secondPostId = responseSecondPost.body.postId;

      const responseUser = await request(app).get(`/api/user/${userId}`);
      expect(responseUser.status).toBe(200);
      expect(responseUser.body.ownedPosts).toContain(firstPostId);
      expect(responseUser.body.ownedPosts).toContain(secondPostId);

      postIds.push(firstPostId);
      postIds.push(secondPostId);
    }
  }, 100000);

  it("should GET all user avatars if it exists", async () => {
    for (const userId of userIds) {
      const response = await request(app).get(`/api/user/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(userId);
      const avatarId = response.body.userAvatarUrl;

      if (avatarId.length !== 0 || avatarId !== undefined || avatarId !== "") {
        const responseFromGet = await request(app).get(
          `/api/files/userAvatar/${avatarId}`
        );

        expect(responseFromGet.status).toBe(200);
        expect(responseFromGet.body.length).toBeGreaterThan(0);
      }
    }
  }, 100000);

  it("should GET all post albumCovers if it exists", async () => {
    for (const postId of postIds) {
      const response = await request(app).get(`/api/post/${postId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(postId);
      const albumCoverId = response.body.albumCoverUrl;

      if (
        albumCoverId.length !== 0 ||
        albumCoverId !== undefined ||
        albumCoverId !== ""
      ) {
        const response = await request(app).get(
          `/api/files/albumCover/${albumCoverId}`
        );

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
      }
    }
  }, 100000);

  it("should GET all post audio if it exists", async () => {
    for (const postId of postIds) {
      const response = await request(app).get(`/api/post/${postId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(postId);
      const audioId = response.body.audioUrl;

      if (audioId !== undefined || audioId !== "") {
        const response = await request(app).get(`/api/files/audio/${audioId}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
      }
    }
  }, 100000);
});
