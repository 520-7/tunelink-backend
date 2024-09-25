import express from "express";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const port = 3000;

app.use(express.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/health", (req, res) => {
  res.status(200).send("Server up and running");
});

app.post("/get_feed", async (req, res) => {
  try {
    const data = await fs.readFile(
      join(__dirname, "data", "dummy.json"),
      "utf-8"
    );
    const jsonData = JSON.parse(data);

    setTimeout(() => {
      res.json(jsonData);
    }, 2000);
  } catch (error) {
    console.error("Error in /get_feed:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Runs the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
