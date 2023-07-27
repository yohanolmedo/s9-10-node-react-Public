import {
  createNewForm,
  createNewResponse,
  updateFormService,
} from "../services/form.service.js";
import { HttpException } from "../utils/HttpException.js";
import Form from "../models/form.model.js";

//Controller para la creación de un formulario
export const createForm = async (req, res) => {
  try {
    const { title, description, rolesAllowed, questions, comments } = req.body;

    // Obtener el token desde la cookie
    const token = req.cookies.token;

    // Llamamos al servicio que crea el formulario
    const newForm = await createNewForm({
      title,
      description,
      token,
      rolesAllowed,
      questions,
      comments,
    });

    res.status(201).json(newForm);
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

//Controller para la respuesta del usuario
export const createResponse = async (req, res) => {
  try {
    const { userId, evaluatedUserId, formId, answers, comments } = req.body;

    // Guardar la respuesta en la base de datos
    const newResponse = await createNewResponse({
      userId,
      evaluatedUserId,
      formId,
      answers,
      comments,
    });

    const savedResponse = await newResponse.save();

    res.status(201).json({
      message: "Respuesta creada con éxito",
      response: savedResponse,
    });
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

//Controller para obtener todos los formularios
export const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find().select({
      comments: 0,
      __v: 0,
      questions: 0,
    });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller para obtener un formulario
export const getFormById = async (req, res) => {
  const formId = req.params.id;

  try {
    // Buscar el formulario por su ID
    const form = await Form.findById(formId).select({
      __v: 0,
    });

    if (!form) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    return res.status(200).json(form);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateFormController = async (req, res) => {
  const formId = req.params.id;
  const { _id, __v, createdBy, ...updatedFields } = req.body;

  try {
    // Guardar el formulario actualizado con las preguntas correspondientes
    const updatedForm = await updateFormService(formId, updatedFields);

    return res.status(200).json(updatedForm);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Controller para eliminar un formulario
export const deleteForm = async (req, res) => {
  const formId = req.params.id;

  try {
    // Buscar el formulario por su ID
    const deletedForm = await Form.findByIdAndRemove(formId);

    if (!deletedForm) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Formulario eliminado exitosamente" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
