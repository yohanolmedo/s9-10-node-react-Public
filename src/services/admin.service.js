import bcrypt from "bcryptjs";
import { HttpException } from "../utils/HttpException.js";
import { decodeToken, extractTokenFromCookie } from "../utils/cookieUtils.js";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Equip from "../models/equip.model.js";
import { getUsersByRoleController } from "../controllers/admin.controller.js";
//Registrar un usuario Admin
export const registerUser = async ({ email, password, username }) => {
  const adminFound = await Admin.findOne({ email });

  if (adminFound) {
    throw new HttpException("Admin already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  //Creamos el usuario
  const newAdmin = new Admin({
    email,
    username,
    password: hashedPassword,
  });
  //Guardamos el usuario en la db
  const adminSaved = await newAdmin.save();

  return adminSaved;
};

//Loguear usuario Admin

export const loginAdmin = async ({ email, password }) => {
  const adminFound = await Admin.findOne({ email });

  if (!adminFound) {
    throw new HttpException("Admin not found", 404);
  }

  const isMatch = await bcrypt.compare(password, adminFound.password);

  if (!isMatch) {
    throw new HttpException("Email and/or password is invalid ", 400);
  }

  return adminFound;
};

//Consultar perfil del usuario admin

export const getAdminProfile = async (cookieString) => {
  const token = extractTokenFromCookie(cookieString);
  const decodedToken = decodeToken(token);

  const adminId = decodedToken.id;
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new HttpException("Admin not found", 404);
  }

  return admin;
};

// Crear un nuevo usuario
export const createNewUser = async ({ email, username, password, role }) => {
  //Validar que no exista el email o username en la BD
  const adminFound = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (adminFound) {
    throw new HttpException("Email and/or username already exists", 409);
  }

  //
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    username,
    password: hashedPassword,
    role,
  });
  const savedUser = await newUser.save();

  //Eliminar los campos de contraseña y __v
  const {
    password: omitPassword,
    __v: omitVersion,
    ...userWithoutSensitiveFields
  } = savedUser.toObject();

  return userWithoutSensitiveFields;
};

export const updateUser = async (id, role, subrole, equip) => {
  const updates = {};

  // Buscar el ObjectId del rol correspondiente
  if (role) {
    const roleData = await Role.findOne({ name: role });
    if (!roleData) {
      throw new Error(`Role with name "${role}" not found`);
    }
    updates.role = roleData._id;
  }

  // Verificar y asignar el subrol (si está presente y es válido)
  if (subrole === "team leader" || subrole === "employee") {
    updates.subrole = subrole;
  } else if (subrole) {
    throw new Error("Invalid subrole. It must be either 'team leader' or 'employee'");
  }

  // Buscar el ObjectId del equipo correspondiente (si está presente)
  if (equip) {
    const equipData = await Equip.findOne({ name: equip });
    if (!equipData) {
      throw new Error(`Equip with name "${equip}" not found`);
    }
    updates.equip = equipData._id;
  }

  // Realizar la actualización del usuario
  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate("equip role");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const getUsersByRoleName = async (roleName) => {
  // Buscar el rol por su nombre
  const role = await Role.findOne({ name: roleName });

  if (!role) {
    throw new Error(`Role with name "${roleName}" not found`);
  }

  // Obtener los usuarios asociados al rol
  const users = await User.find({ role: role._id });

  return users;
};

export const getUsersBySubrole = async (subrole) => {
  // Verificar si el subrole es válido
  if (!["team leader", "employee"].includes(subrole)) {
    throw new Error("Invalid subrole. It must be either 'team leader' or 'employee'");
  }

  // Buscar los usuarios con el subrole proporcionado
  const users = await User.find({ subrole });

  return users;
};

export const getUsersByEquip = async (equipName) => {
  // Buscar el equipo por su nombre
  const equip = await Equip.findOne({ name: equipName });

  if (!equip) {
    throw new Error(`Equip with name "${equipName}" not found`);
  }

  // Obtener los usuarios asociados al equipo (miembros)
  const users = await User.find({ equip: equip._id });

  return users;
};

export const createNewEquip = async ({ name, description }) => {
  const equip = new Equip({ name, description });
  const savedEquip = await equip.save();
  return savedEquip;
};

export const addMembersToEquip = async (equipName, memberUsernames) => {
  // Buscar el equipo por su nombre
  const equip = await Equip.findOne({ name: equipName });
  if (!equip) {
    throw new Error(`Equip with name "${equipName}" not found`);
  }

  // Buscar los usuarios por sus nombres y obtener sus IDs
  const memberIds = [];
  for (const username of memberUsernames) {
    const user = await User.findOne({ username });
    if (user) {
      memberIds.push(user._id);
    }
  }

  // Agregar los miembros al equipo y guardar los cambios
  equip.members = memberIds;
  const savedEquip = await equip.save();

  return savedEquip;
};