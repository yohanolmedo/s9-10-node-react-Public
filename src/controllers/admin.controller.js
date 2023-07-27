import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Equip from "../models/equip.model.js";
import { HttpException } from "../utils/HttpException.js";
import { createAccessToken } from "../lib/jwt.js";
import {
  createNewUser,
  getAdminProfile,
  loginAdmin,
  registerUser,
  getUsersByRoleName,
  getUsersBySubrole,
  getUsersByEquip, 
  createNewEquip, 
  addMembersToEquip
} from "../services/admin.service.js";
import { processImage } from "../helpers/processImage.js";

export const register = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    console.log(email, "email controller");
    const register = await registerUser({ email, password, username });

    //Creamos el token
    const token = await createAccessToken({ id: register._id });
    //Guardamos el token en la cookie
    res.cookie("token", token);

    //Devolvemos el usuario
    res.status(201).json({
      id: register._id,
      username: register.username,
      email: register.email,
      createdAt: register.createdAt,
      updatedAt: register.updatedAt,
    });
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminFound = await loginAdmin({ email, password });

    //Creamos el token
    const token = await createAccessToken({ id: adminFound._id });
    //Guardamos el token en la cookie
    res.cookie("token", token);
    //Devolvemos el usuario
    res.status(201).json({
      id: adminFound._id,
      username: adminFound.username,
      email: adminFound.email,
      createdAt: adminFound.createdAt,
      updatedAt: adminFound.updatedAt,
    });
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
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
  //Extraer cookie y decodificar token
  try {
    const cookieString = req.headers.cookie;
    const admin = await getAdminProfile(cookieString);
    res.status(200).json({
      id: admin._id,
      email: admin.email,
      username: admin.username,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { email, username, password, role } = req.body;
  try {
    const savedUser = await createNewUser({ email, username, password, role });
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, subrole, equip } = req.body;

    // Verificar si el role existe en la base de datos o crearlo si no existe
    let roleId;
    if (role) {
      const roleData = await Role.findOne({ name: role });
      if (!roleData) {
        const newRole = new Role({ name: role, users: [id] });
        await newRole.save();
        roleId = newRole._id;
      } else {
        roleId = roleData._id;
        if (!roleData.users.includes(id)) {
          roleData.users.push(id);
          await roleData.save();
        }
      }
    }

    // Verificar si el equip existe en la base de datos o crearlo si no existe
    let equipId;
    if (equip) {
      const equipData = await Equip.findOne({ name: equip });
      if (!equipData) {
        const newEquip = new Equip({ name: equip, members: [id] });
        await newEquip.save();
        equipId = newEquip._id;
      } else {
        equipId = equipData._id;
        if (!equipData.members.includes(id)) {
          equipData.members.push(id);
          await equipData.save();
        }
      }
    }

    // Actualizar el usuario con los roles y equip correspondientes
    const updates = {};
    if (roleId) {
      updates.role = roleId;
    }
    if (equipId) {
      updates.equip = equipId;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    // Verificar si el usuario existe antes de actualizar el subrole
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Actualizar el subrole del usuario si se proporcionó en la solicitud y es válido
    if (subrole && ["team leader", "employee"].includes(subrole)) {
      user.subrole = subrole;
      await user.save();
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role.name,
      equip: user.equip.name,
      subrole: user.subrole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const uploadPictureAdmin = async (req, res) => {
  const images = req.files;
  let imagePaths = [];
  console.log(req.user.id);
  if (images) {
    try {
      imagePaths = await Promise.all(
        images.map((image) => processImage(image))
      );
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error al procesar las imágenes", Eerror: error });
    }
  }
  res.status(200).json({ message: imagePaths });
};

export const getUsersByRoleController = async (req, res) => {
  try {
    const { roleName } = req.params;

    // Obtener todos los usuarios con el rol proporcionado
    const users = await getUsersByRoleName(roleName);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersBySubroleName = async (req, res) => {
  try {
    const { subroleName } = req.params;
    console.log("Subrole Name:", subroleName); 
    // Obtener todos los usuarios con el subrol proporcionado
    const users = await getUsersBySubrole(subroleName);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersByEquipName = async (req, res) => {
  try {
    const { equipName } = req.params;

    // Obtener todos los usuarios con el equipo proporcionado
    const users = await getUsersByEquip(equipName);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEquip = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newEquip = await createNewEquip({ name, description });
    res.status(201).json(newEquip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMembersToEquipName = async (req, res) => {
  try {
    const { equipId } = req.params;
    const { members } = req.body;

    // Buscar los usuarios en la base de datos por nombre
    const foundMembers = await User.find({ username: { $in: members } });

    // Obtener los IDs de los miembros encontrados
    const memberIds = foundMembers.map((member) => member._id);

    // Agregar los miembros al equipo
    await Equip.findByIdAndUpdate(equipId, { $push: { members: { $each: memberIds } } });

    res.status(200).json({ message: "Members added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};