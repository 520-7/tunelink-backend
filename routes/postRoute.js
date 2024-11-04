import {
  getPostById,
  deletePostById,
  updatePostById,
} from "../controllers/postController.js";
import express from "express";

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
 *   put:
 *     summary: Updates the likes count of a post
 *     description: Allows updating the likes count for a specific post by its ID. This operation can only be performed by authorized users.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Unique identifier of the post
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - likesCount
 *             properties:
 *               likesCount:
 *                 type: integer
 *                 description: The new likes count to update the post with
 *                 example: 42
 *     responses:
 *       200:
 *         description: Likes count updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post updated successfully
 *       400:
 *         description: Invalid input, object invalid
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put("/:postId", updatePostById);

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
