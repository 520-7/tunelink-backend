import express from "express";
import { getFeed, getFeedPost } from "../controllers/feedController.js";

const router = express.Router();

/**
 * @swagger
 * /api/feed/get_feed_post/{userId}:
 *   get:
 *     summary: Get single feed post based on recommendation
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A successful response
 *       500:
 *         description: Server error
 */
router.get("/get_feed_post/:userId", getFeedPost);

/**
 * @swagger
 * /api/feed/get_feed/{userId}:
 *   get:
 *     summary: Get feed data, optional pass userId
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A successful response
 *       500:
 *         description: Server error
 */
router.get("/get_feed/:userId", getFeed);

export default router;
