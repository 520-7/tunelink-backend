import {
  getUserAvatar,
  getAlbumCover,
  getAudio,
} from "../controllers/fileController.js";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * /api/files/userAvatar/{fileId}:
 *   get:
 *     summary: Get User Avatar
 *     description: Retrieve a user avatar image by its file ID.
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID of the user avatar to download.
 *     responses:
 *       200:
 *         description: User avatar image file successfully streamed.
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: User avatar not found.
 *       500:
 *         description: Server error.
 */
router.get("/userAvatar/:fileId", getUserAvatar);

/**
 * @swagger
 * /api/files/albumCover/{fileId}:
 *   get:
 *     summary: Get Album Cover
 *     description: Retrieve an album cover image by its file ID.
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID of the album cover to download.
 *     responses:
 *       200:
 *         description: Album cover image file successfully streamed.
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Album cover not found.
 *       500:
 *         description: Server error.
 */
router.get("/albumCover/:fileId", getAlbumCover);

/**
 * @swagger
 * /api/files/audio/{fileId}:
 *   get:
 *     summary: Get Audio File
 *     description: Retrieve an audio file by its file ID.
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID of the audio file to download.
 *     responses:
 *       200:
 *         description: Audio file successfully streamed.
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Audio file not found.
 *       500:
 *         description: Server error.
 */
router.get("/audio/:fileId", getAudio);

export default router;
