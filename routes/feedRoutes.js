import express from "express";
import { getFeed } from "../controllers/feedController.js";

const router = express.Router();

/**
 * @swagger
 * /api/get_feed:
 *   post:
 *     summary: Get feed data
 *     responses:
 *       200:
 *         description: A successful response
 *       500:
 *         description: Server error
 */
router.post("/get_feed", getFeed);

export default router;
