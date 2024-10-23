import { getPostById, deletePostById } from "../controllers/postController.js";
import express from "express";
import multer from "multer";

const router = express.Router();

/**
 * @swagger
 * /api/post/{postId}:
 *   get:
 *     summary: Retrieves a post by ID
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve.
 *     responses:
 *       200:
 *         description: Post retrieved successfully, returns a json object of post, includes fileIds of albumCover and audio.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/:postId", getPostById);

/**
 * @swagger
 * /api/post/{postId}:
 *   delete:
 *     summary: Deletes a post by ID
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete.
 *     responses:
 *       200:
 *         description: Post deleted successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete("/:postId", deletePostById);

export default router;
