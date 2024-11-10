import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";

// Test for the /health route
describe("Health Check Endpoint", () => {
  it("should return 200 on /health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Server up and running.");
  });
});

// Tests for /api/feed route
describe("Feed Routes", () => {

  it("should handle non-existent routes under /api/feed gracefully", async () => {
    const response = await request(app).get("/api/feed/nonexistent");
    expect(response.status).toBe(404);
  });
});

// General error handling test
describe("Non-Existent Routes", () => {
  it("should return 404 for non-existent routes", async () => {
    const response = await request(app).get("/non-existent-route");
    expect(response.status).toBe(404);
  });
});