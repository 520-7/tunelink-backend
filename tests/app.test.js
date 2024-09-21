import request from "supertest";
import app from "../app.js";

describe("Test Endpoints", () => {
  it("should return 200 on /health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });

  it("should return 200 and valid JSON on /get_feed", async () => {
    const response = await request(app).get("/get_feed");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ feed: ["item1", "item2"] });
  });
});
