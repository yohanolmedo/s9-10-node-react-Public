import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import upload from "../middlewares/multer.js";
import {
  register,
  login,
  logout,
  profile,
  listUsers,
  createUser,
  deleteUser,
  editUser,
  uploadPictureAdmin,
  getUsersByRoleController,
  getUsersBySubroleName,
  getUsersByEquipName,
  createEquip, 
  addMembersToEquipName
} from "../controllers/admin.controller.js";

import {calculateCombinedScoreAverage, calculateSoftSkillsScore, calculateTechnicalSkillsScore, getCommentsAndPraiseCount, getScoresAndComments} from "../services/score.service.js";

import { createForm, deleteForm, getAllForms, getFormById, updateFormController } from "../controllers/form.controller.js";


const adminRouter = Router();
adminRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to feedback app, get users" });
});
adminRouter.post("/register", register);
adminRouter.post("/login", login);
adminRouter.use(authRequired);
adminRouter.post("/logout", logout);
adminRouter.get("/profile", profile);

adminRouter.use(authRequired);

adminRouter.get("/users", listUsers);
adminRouter.post("/users", createUser);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.put("/users/:id", editUser);
adminRouter.get("/users/roles/:roleName", getUsersByRoleController);
adminRouter.get("/users/subrole/:subroleName", getUsersBySubroleName);
adminRouter.get("/users/equip/:equipName", getUsersByEquipName);
adminRouter.post("/equip", createEquip);
adminRouter.put("/equip/:equipId", addMembersToEquipName);

//Formuluarios
adminRouter.post("/form", createForm); //Crear Formulario
adminRouter.get("/form/:id", getFormById); //Obtener un Formulario por ID
adminRouter.put("/editForm/:id", updateFormController); //Editar Formulario
adminRouter.delete("/deleteForm/:id", deleteForm); //Eliminar un Formulario

// Obtener todos los formularios
adminRouter.get("/forms", getAllForms);

//respuestas
adminRouter.get("/users/soft-skills/:userId", calculateSoftSkillsScore);
adminRouter.get("/users/tech-skills/:userId", calculateTechnicalSkillsScore);
adminRouter.get("/users/all-scores/:userId", getScoresAndComments );
adminRouter.get("/users/comments-praises/:userId", getCommentsAndPraiseCount);
adminRouter.get("/users/score-combinated/:userId", calculateCombinedScoreAverage);


/* Queda pendiente donde se va a guardar la imagen cuando la suba el admin */
adminRouter.post("/uploadPicture", upload.array("images"), uploadPictureAdmin);

export default adminRouter;
