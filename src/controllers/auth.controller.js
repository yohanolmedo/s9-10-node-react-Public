import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../lib/jwt.js";
import { processImage } from "../helpers/processImage.js";
export const register = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json(["User already exists"]);
    const hashedPassword = await bcrypt.hash(password, 10);
    //Creamos el usuario
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });
    //Guardamos el usuario en la db
    const userSaved = await newUser.save();
    //Creamos el token
    const token = createAccessToken({ id: userSaved._id });
    //Guardamos el token en la cookie
    res.cookie("token", token);
    //Devolvemos el usuario
    res.status(201).json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    //Creamos el token
    const token = await createAccessToken({ id: userFound._id });
    //Guardamos el token en la cookie
    res.cookie("token", token);
    //Devolvemos el usuario
    res.status(201).json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* use by superadmin */
export const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, password } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.email = email || user.email;
    user.username = username || user.username;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      email: updatedUser.email,
      username: updatedUser.username,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const uploadPicture = async (req, res) => {
  const images = req.files;
  let imagePaths = [];
  console.log(req.user.id);
  if (images) {
    try {
      imagePaths = await Promise.all(
        images.map((image) => processImage(image))
      );
      const user = await User.findById(req.user.id);
      user.profilePicture = imagePaths[0];
      await user.save();
      console.log(user);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error al procesar las imágenes", Eerror: error });
    }
  }
  res.status(200).json({ message: imagePaths, user: req.user.id });
};
export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.send(false);
  jwt.verify(token, TOKEN_SECRET, async (error, user) => {
    if (error) return res.sendStatus(401);

    const userFound = await User.findById(user.id);
    if (!userFound) return res.sendStatus(401);

    return res.json(userFound);
  });
};
