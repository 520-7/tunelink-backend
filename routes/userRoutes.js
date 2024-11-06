import express from "express";
import {
  readUserById,
  deleteUserById,
  updateUserById,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * /api/user/{userId}:
 *   delete:
 *     summary: Deletes a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         type: string
 *         description: The ID of the user to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       400:
 *         description: Invalid user ID format.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete("/:userId", deleteUserById);

/**
 * @swagger
 * /api/user/{userId}:
 *   put:
 *     summary: Updates a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         type: string
 *         description: The ID of the user to update.
 *       - in: body
 *         name: user
 *         description: The user data to update.
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *                type: string
 *             userAvatarUrl:
 *                type: string
 *             userName:
 *                type: string
 *             profileName:
 *               type: string
 *             followerCount:
 *               type: number
 *             following:
 *               type: array
 *               items:
 *                 type: string
 *             totalLikeCount:
 *               type: number
 *             profileDescription:
 *               type: string
 *             genres:
 *               type: array
 *               items:
 *                 type: string
 *             ownedPosts:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
// Swagger for this route has no body, will not work while using swagger, you can test on postman
router.put("/:userId", updateUserById);

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Reads a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/:userId", readUserById);

export default router;
