import express from "express";
import multer from "multer";
import { uploadMP3File, uploadUser } from "../controllers/uploadController.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const router = express.Router();

/**
 * @swagger
 * /api/upload/uploadUser:
 *   post:
 *     summary: Uploads User to Mongo with optional file
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The user's avatar (optional).
 *       - in: formData
 *         name: user
 *         description: The user object as JSON string.
 *         type: JSON
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/uploadUser", upload.single("file"), async (req, res, next) => {
  try {
    if (req.body.user) {
      req.body = JSON.parse(req.body.user);
    }

    await uploadUser(req, res);
  } catch (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File size is too large. Max size is 10MB." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return next(err);
    }
  }
});

/**
 * @swagger
 * /api/upload/uploadMP3:
 *   post:
 *     summary: Uploads MP3 to Mongo
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The MP3 file to upload.
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *         description: Bad request (e.g., file too large)
 *       500:
 *         description: Server error
 */
router.post("/uploadMP3", upload.single("file"), async (req, res, next) => {
  try {
    await uploadMP3File(req, res);
  } catch (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File size is too large. Max size is 10MB." });
      }
      return res.status(400).json({ error: err.message });
    } else {
      return next(err);
    }
  }
});

export default router;
