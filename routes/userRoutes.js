import express from "express";
import {
  readUserById,
  deleteUserById,
  updateUserById,
  readUserByEmail,
  readUserByUsername,
  findUserByEmailEndpoint,
  fetchUsersByField,
} from "../controllers/userController.js";
import { uploadFileToGridFS } from "../controllers/uploadController.js";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const router = express.Router();

/**
 * @swagger
 * /api/user/search-by-genre:
 *   get:
 *     summary: Searches for users by genre
 *     parameters:
 *       - in: query
 *         name: genre
 *         required: true
 *         type: string
 *         description: The genre to search for.
 *     responses:
 *       200:
 *         description: Users found successfully.
 *       400:
 *         description: Genre is required.
 *       404:
 *         description: No users found for this genre.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/search-by-genre/:genre", fetchUsersByField);

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
router.put("/:userId", upload.single("userAvatar"), updateUserById);

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

router.get("/email", readUserByEmail);

/**
 * @swagger
 * /api/user/username/{username}:
 *   get:
 *     summary: Reads a user by username
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         type: string
 *         description: The username of the user to retrieve.
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/username/:username", readUserByUsername);

/**
 * @swagger
 * /api/user/find-by-email/{email}:
 *   get:
 *     summary: Finds a user by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         type: string
 *         description: The email of the user to find.
 *     responses:
 *       200:
 *         description: User found successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/find-by-email/:email", findUserByEmailEndpoint);

export default router;
