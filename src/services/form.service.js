import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import Form from "../models/form.model.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Response from "../models/answer.model.js";
import Admin from "../models/admin.model.js";
import { HttpException } from "../utils/HttpException.js";

// Crear un formulario
export const createNewForm = async ({
  title,
  description,
  token,
  rolesAllowed,
  questions,
  comments,
}) => {
  // Validar los datos recibidos
  if (!title || !questions || !comments) {
    throw new HttpException("Faltan campos obligatorios en el formulario", 400);
  }

  // Validar longitud máxima de la descripción
  if (description && description.length > 400) {
    throw new HttpException(
      "La descripción del formulario no puede superar los 400 caracteres",
      400
    );
  }

  //Validar campo Rol

  // Validación del campo rolesAllowed
  if (!rolesAllowed || rolesAllowed.length === 0) {
    throw new HttpException(
      "Rol es un campo obligatorio y debe contener al menos uno válido",
      400
    );
  }

  // Verificación de que los roles existan en la base de datos
  const roles = await Role.find({ name: { $in: rolesAllowed } }).exec();
  if (roles.length !== rolesAllowed.length) {
    throw new HttpException(
      "Alguno de los roles especificados no existe en la base de datos.",
      400
    );
  }

  // Extraer el username del admin que crea el formulario

  // Verificar y decodificar el token para obtener el ID del administrador
  const decodedToken = jwt.verify(token, TOKEN_SECRET);
  const adminId = decodedToken.id;

  // Consultar el administrador por su ID en la base de datos
  const admin = await Admin.findById(adminId);

  // Validar el tipo de preguntas y opciones
  for (const question of questions) {
    if (
      !question.question ||
      !question.type ||
      !["open", "closed", "scale", "yesno", "multiple"].includes(question.type)
    ) {
      throw new HttpException("Pregunta inválida en el formulario", 400);
    }

    // Validar opciones de pregunta cerrada o múltiple
    if (
      (question.type === "closed" || question.type === "multiple") &&
      (!question.options || question.options.length < 2)
    ) {
      throw new HttpException(
        "Pregunta cerrada o de selección múltiple debe tener al menos dos opciones",
        400
      );
    }

    // Validar rango de escala en pregunta de tipo "scale"
    if (
      question.type === "scale" &&
      (!question.scaleRange ||
        typeof question.scaleRange.min !== "number" ||
        typeof question.scaleRange.max !== "number" ||
        question.scaleRange.min >= question.scaleRange.max)
    ) {
      throw new HttpException(
        "Pregunta de escala debe tener un rango válido",
        400
      );
    }

    // Validar opciones de pregunta de tipo "yesno"
    if (question.type === "yesno") {
      if (!question.options || question.options.length !== 2) {
        throw new HttpException(
          "Pregunta de tipo Sí o No debe tener exactamente dos opciones",
          400
        );
      }
      const validOptions = ["true", "false"];
      if (!question.options.every((option) => validOptions.includes(option))) {
        throw new HttpException(
          "Opciones inválidas para pregunta de tipo Sí o No",
          400
        );
      }
    }

    // Validar la categoría de la pregunta
    if (
      !question.category ||
      !["soft skills", "technical skills"].includes(question.category)
    ) {
      throw new HttpException("Categoría inválida en la pregunta", 400);
    }
  }

  // Crear el formulario
  const newForm = await Form.create({
    title,
    description,
    createdBy: admin.username,
    rolesAllowed,
    questions,
    comments,
  });

  return newForm;
};

export const createNewResponse = async ({
  userId,
  evaluatedUserId,
  formId,
  answers,
}) => {
  // Obtener el formulario correspondiente a formId
  const form = await Form.findById(formId);

  // Verificar si el formulario existe
  if (!form) {
    throw new HttpException("Formulario no encontrado", 404);
  }

  // Verificar si el usuario evaluado existe
  const evaluatedUser = await User.findById(evaluatedUserId);
  if (!evaluatedUser) {
    throw new HttpException("Usuario a evaluar no encontrado", 404);
  }

  // Verificar que el usuario que evalúa sea diferente al usuario evaluado
  if (userId === evaluatedUserId) {
    throw new HttpException("No puedes evaluarte a ti mismo", 400);
  }

  // Obtener los IDs de las preguntas del formulario
  const formQuestionIds = form.questions.map((question) =>
    question._id.toString()
  );

  // Obtener los IDs de las preguntas de las respuestas
  const answerQuestionIds = answers.map((answer) => answer.questionId);
  console.log("formQuestionIds:", formQuestionIds);
  console.log("answerQuestionIds:", answerQuestionIds);
  // Verificar que las preguntas en las respuestas coincidan con las preguntas del formulario
  if (
    formQuestionIds.length !== answerQuestionIds.length ||
    !answerQuestionIds.every((questionId) =>
      formQuestionIds.includes(questionId)
    )
  ) {
    throw new HttpException(
      "Respuestas no válidas para el formulario especificado",
      400
    );
  }

  for (const ans of answers) {
    const questionId = ans.questionId;
    const formQuestion = form.questions.find(
      (question) => question._id.toString() === questionId
    );

    // Verificar el tipo de pregunta y realizar la validación correspondiente
    if (formQuestion.type === "closed") {
      const options = formQuestion.options;
      const answer = ans.answer;

      if (!options.includes(answer)) {
        throw new HttpException(
          "Respuesta inválida para pregunta cerrada",
          400
        );
      }
    } else if (formQuestion.type === "scale") {
      const scaleRange = formQuestion.scaleRange;
      const score = ans.score;

      if (
        typeof score !== "number" ||
        score < scaleRange.min ||
        score > scaleRange.max
      ) {
        throw new HttpException(
          "Respuesta no válida para pregunta de escala",
          400
        );
      }
    } else if (formQuestion.type === "multiple") {
      const options = formQuestion.options;
      const answer = ans.answer;

      if (
        !Array.isArray(answer) ||
        !answer.every((option) => options.includes(option))
      ) {
        throw new HttpException(
          "Respuesta no válida para pregunta de opción múltiple",
          400
        );
      }
    } else if (formQuestion.type === "yesno") {
      const answer = ans.answer;

      if (!["true", "false"].includes(answer)) {
        throw new HttpException(
          "Respuesta inválida para pregunta de tipo Sí o No",
          400
        );
      }
    }
  }

  // Crear la nueva respuesta
  const newResponse = await Response.create({
    userId,
    evaluatedUserId,
    formId,
    answers,
  });

  return newResponse;
};

//Editar un formulario
export const updateFormService = async (formId, updatedFields) => {
  const existingForm = await Form.findById(formId);
 
  if (!existingForm) {
    throw new HttpException("Formulario no encontrado", 400);
  }

  // Actualizar o crear preguntas
  const updatedQuestions = [];
  for (const updatedQuestion of updatedFields.questions) {
    if (updatedQuestion._id) {
      // Si la pregunta tiene un _id existente, actualizamos sus campos
      const existingQuestion = existingForm.questions.find(
        (question) => question._id.toString() === updatedQuestion._id
      );
      if (existingQuestion) {
        Object.assign(existingQuestion, updatedQuestion);
        updatedQuestions.push(existingQuestion);
      }
    } else {
      // Si la pregunta no tiene _id, la agregamos como nueva pregunta
      updatedQuestions.push(updatedQuestion);
    }
  }

  // Actualizamos las preguntas en el formulario
  existingForm.questions = updatedQuestions;

  // Actualizar los otros campos del formulario
  Object.assign(existingForm, updatedFields);

  // Guardar el formulario actualizado con las preguntas correspondientes
  const updatedForm = await existingForm.save();
  return updatedForm;
};
