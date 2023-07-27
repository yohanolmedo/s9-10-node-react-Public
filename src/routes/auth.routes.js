import { Router } from "express";
import {
  login,
  logout,
  profile,
  register,
  editProfile,
  verifyToken,
  uploadPicture,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import validateSchema from "../middlewares/validateSchema.js";
import { loginSchema, registerSchema } from "../Schemas/auth.schema.js";
import upload from "../middlewares/multer.js";
import { createResponse } from "../controllers/form.controller.js";
const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: /api/users
 *   description: Authentication
 */


/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Home
 *     tags: [/api/users]
 *     responses:
 *       "200":
 *         description: Return user 
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Error'
 *              
 */
userRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to feedback app, get users" });
});
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrar un Usuario
 *     tags: [/api/users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Debe ser Único
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Debe ser mínimo 6 caracteres 
 *             example:
 *               username: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "201":
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 */
userRouter.post("/register", validateSchema(registerSchema), register);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login
 *     tags: [/api/users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         headers: 
 *           Set-Cookie:
 *             schema: 
 *               type: string
 *               example: Token=abcde12345; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "404":
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: User not found 
 *       "500":
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Error sys 
 */
userRouter.post("/login", validateSchema(loginSchema), login);

userRouter.use(authRequired);

/**
 * @swagger
 * /users/verify:
 *   get:
 *     summary: Check Session user if cookie is valid
 *     security:
 *       - cookieAuth: []
 *     tags: [/api/users]
 *     responses:
 *       "200":
 *         description: Return user Profile 
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User' 
 *       "401":
 *         description: Token expire or token invalidate
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/responses/Unauthorized'
 */
userRouter.get("/verify", verifyToken);
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Profile Get Data
 *     security:
 *       - cookieAuth: []
 *     tags: [/api/users]
 *     responses:
 *       "200":
 *         description: Return user Profile 
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 */
userRouter.get("/profile", profile);
/**
 * @swagger
 * /api/users/uploadPicture:
 *    post:
 *      security:
 *       - cookieAuth: []
 *      summary: Uploads a file.
 *      tags: [/api/users]
 *      consumes:
 *        - multipart/form-data
 *      parameters:
 *        - in: formData
 *          required: true
 *          x-mimetype: image/jpeg
 *          name: images
 *          type: file
 *          description: The file image to upload in formats ["image/jpeg", "image/jpg", "image/png"] .
 *      responses:
*       "200":
 *         description: OK profilePicture is update
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 */

userRouter.post("/uploadPicture", upload.array("images"), uploadPicture);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout
 *     security:
 *       - cookieAuth: []
 *     tags: [/api/users]
 *     responses:
 *       "200":
 *         description: User logout and cookie 
 */
userRouter.post("/logout", logout);


/**
 * @swagger
 * /users/edit-profile/:id:
*   put:
 *     summary: EDIT USER by ID use only superadmin
 *     tags: [/api/users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           required: true
 *           description: String ID of the user to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password 
 *                 default: undefined
 *               username:
 *                 type: string
 *             example:
 *               email: fake@example.com
 *               username: fakeuser
 *               password: password1
 *      
 *     responses:
 *       "200":
 *         description: Return user Profile 
 *         content:
 *           application/json:
 *             schema:
*              type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *             example:
 *               email: fake@example.com
 *               username: fakeuser
  *       "500":
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Error sys 
 */
userRouter.put("/edit-profile/:id", editProfile);

userRouter.post("/replyForm", createResponse);



export default userRouter;
