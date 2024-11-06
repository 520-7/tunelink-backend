import express from "express";
import multer from "multer";
import {
  uploadMP3File,
  uploadUser,
  uploadPost,
} from "../controllers/uploadController.js";

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
 *         name: userAvatar
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
router.post(
  "/uploadUser",
  upload.single("userAvatar"),
  async (req, res, next) => {
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
  }
);

/**
 * @swagger
 * /api/upload/uploadPost:
 *   post:
 *     summary: Uploads a new post with optional album cover and audio files
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: albumCover
 *         type: file
 *         description: The album cover image file (optional).
 *       - in: formData
 *         name: audio
 *         type: file
 *         description: The audio file (optional).
 *       - in: formData
 *         name: ownerUser
 *         type: string
 *         required: true
 *         description: The ID of the user who owns the post.
 *       - in: formData
 *         name: likesCount
 *         type: integer
 *         format: int32
 *         description: The initial number of likes for the post (optional, defaults to 0).
 *       - in: formData
 *         name: timestamp
 *         type: string
 *         format: date-time
 *         required: true
 *         description: The timestamp when the post was created.
 *       - in: formData
 *         name: caption
 *         type: string
 *         required: true
 *         description: The caption for the post.
 *       - in: formData
 *         name: outLinks
 *         type: string
 *         description: JSON string containing outgoing links (optional).
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  "/uploadPost",
  upload.fields([
    { name: "albumCover", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      await uploadPost(req, res);
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
  }
);

export default router;
