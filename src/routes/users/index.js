const express = require("express");
const { register, login } = require("../../controllers/UserControllers");

const router = express.Router(); 
const auth = require("../../middleware/auth");

//Get all users
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Returns a list of users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", auth, (req, res) => {
  res.status(200).json({
    message: "Get all users",
  });
});

//Login
/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successfully
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 * 
 */
router.post("/login", login);

//Register
/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

module.exports = router;