import express from "express";
import { getFeed } from "../controllers/feedController.js";

const router = express.Router();

/**
 * @swagger
 * /api/feed/get_feed:
 *   post:
 *     summary: Get feed data, optional pass userId
 *     parameters:
 *       - in: path
 *         name: userId
 *     responses:
 *       200:
 *         description: A successful response
 *       500:
 *         description: Server error
 */
router.post("/get_feed", getFeed);

export default router;
