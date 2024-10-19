import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";

// describe("Test Endpoints", () => {
//   it("should return 200 on /health", async () => {
//     const response = await request(app).get("/health");
//     expect(response.status).toBe(200);
//     expect(response.text).toBe("Server up and running.");
//   });

//   it("should return 200 and valid JSON on /api/get_feed", async () => {
//     const response = await request(app).post("/api/get_feed");
//     expect(response.status).toBe(200);
//   });
// });
