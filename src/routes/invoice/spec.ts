/**
 * @swagger
 * components:
 *   schemas:
 *     PackagePayment:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - totalMembers
 *         - price
 *         - isActive
 *         - createdAt
 *         - updatedAt
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the package
 *         name:
 *           type: string
 *           description: The name of the package
 *         description:
 *           type: string
 *           description: The description of the package
 *         totalMembers:
 *           type: number
 *           format: float
 *           description: The total number of members in the package
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the package
 *         isActive:
 *           type: boolean
 *           description: Whether the package is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the package was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the package was updated
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The id of the user who created the package
 *       example:
 *         id: "d5fE_asz"
 *         name: "Premium Package"
 *         description: "This is a premium package"
 *         totalMembers: 100
 *         price: 99.99
 *         isActive: true
 *         createdAt: "2022-01-01T00:00:00Z"
 *         updatedAt: "2022-01-01T00:00:00Z"
 *         userId: "a1b2c3d4"
 */

/**
 * @swagger

 * /api/package:
 *   get:
 *     summary: Retrieve a list of packages
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of packages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PackagePayment'
 *       401:
 *         description: Authorization information is missing or invalid
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Internal Server Error"
 */
