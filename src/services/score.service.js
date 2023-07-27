import UserScore from "../models/userScore.model.js";
import userModel from "../models/user.model.js";
import Response from "../models/answer.model.js";
import mongoose from "mongoose";
import { HttpException } from "../utils/HttpException.js";
// Calcular puntuación de habilidades blandas
export const calculateSoftSkillsScore = async (req, res) => {
  try {
    // Buscar las respuestas del usuario en el formulario (category: "soft skills")
    const userId = req.params.userId; // Asegúrate de que req.params.userId sea el ObjectId válido
    console.log(userId);
    // Buscar las respuestas del usuario en el formulario (category: "soft skills")
    const responses = await Response.find({ userId });
    // Objeto para almacenar el ranking de puntajes de preguntas de tipo escala
    const ranking = {};

    responses.forEach((response) => {
      const { answers } = response;
      console.log(response);
      for (const answer of answers) {
        if (answer.category === "soft" && answer.type === "scale") {
          // Si la respuesta pertenece a la categoría "soft skills" y es de tipo "escala"
          const { questionId, score } = answer;

          // Agregar o actualizar el puntaje en el ranking
          if (!ranking[questionId] || ranking[questionId] < score) {
            ranking[questionId] = score;
          }
        }
      }
    });

    // Convertir el objeto de ranking en un array de objetos para poder ordenarlos
    const rankingArray = Object.entries(ranking).map(([questionId, score]) => ({
      questionId,
      score,
    }));

    // Ordenar el ranking por puntajes de mayor a menor
    rankingArray.sort((a, b) => b.score - a.score);

    // Devolver el ranking ordenado
    // return rankingArray;
    res.json(rankingArray);
  } catch (error) {
    console.log(error);
  }
};


export const calculateTechnicalSkillsScore = async (req, res) => {
  try {
    // Buscar las respuestas del usuario en el formulario (category: "technical skills")
    const userId = req.params.userId; // Asegúrate de que req.params.userId sea el ObjectId válido
    console.log(userId);
    // Buscar las respuestas del usuario en el formulario (category: "technical skills")
    const responses = await Response.find({ userId });
    // Objeto para almacenar el ranking de puntajes de preguntas de tipo escala
    const ranking = {};

    responses.forEach((response) => {
      const { answers } = response;
      console.log(response);
      for (const answer of answers) {
        if (answer.category === "technical" && answer.type === "scale") {
          // Si la respuesta pertenece a la categoría "technical skills" y es de tipo "escala"
          const { questionId, score } = answer;

          // Agregar o actualizar el puntaje en el ranking
          if (!ranking[questionId] || ranking[questionId] < score) {
            ranking[questionId] = score;
          }
        }
      }
    });

    // Convertir el objeto de ranking en un array de objetos para poder ordenarlos
    const rankingArray = Object.entries(ranking).map(([questionId, score]) => ({
      questionId,
      score,
    }));

    // Ordenar el ranking por puntajes de mayor a menor
    rankingArray.sort((a, b) => b.score - a.score);

    // Devolver el ranking ordenado
    // return rankingArray;
    res.json(rankingArray);
  } catch (error) {
    console.log(error);
  }
};



// Obtener comentarios y recuento de elogios
export const getCommentsAndPraiseCount = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userResponse = await Response.findOne({ userId });
    console.log(userId);
    
    let comments = "";
    let praise = false;
    let praiseCount = 0;

    userResponse.answers.forEach((response) => {
      if (response.comment) {
        comments += response.comment + "\n";
      }

      if (response.praise) {
        praise = true;
        praiseCount++;
      }
    });

    res.json({
      comments,
      praise,
      praiseCount,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Internal server error");
  }
};


export const getScoresAndComments = async (req, res) => {
  try {
    const userId = req.params.userId;
 
    const userResponse = await Response.findOne({ userId });
    console.log(userId);

    const softSkills = {};
    const technicalSkills = {};

    userResponse.answers.forEach((response) => {
      const { skill, category, type, score, answer: answerValue } = response;

      if (category === "technical" && skill) {
        if (type === "scale") {
          technicalSkills[skill] = score;
        } else {
          technicalSkills[skill] = answerValue;
        }
      } else if (category === "soft" && skill) {
        if (type === "scale") {
          softSkills[skill] = score;
        } else {
          softSkills[skill] = answerValue;
        }
      }
    });

    const comments = userResponse.comment.map((comment) => comment.content).join("\n");

    const praise = userResponse.comment.some((comment) => comment.type === "praise");
    const praiseCount = praise ? 1 : 0;

    res.json({
      userId,
      "soft skills": softSkills,
      "technical skills": technicalSkills,
      comments,
      praise,
      praiseCount,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Internal server error");
  }
};


// Calcular puntuación general de habilidades blandas

// export const calculateOverallSoftSkillsForAllUsers = async () => {
//   try {
//     // Obtener todos los usuarios de la base de datos
//     const allUsers = await User.find();

//     // Objeto para almacenar los puntajes promedio de soft skills por usuario
//     const overallSoftSkillsScores = {};

//     // Calcular el puntaje promedio de soft skills para cada usuario
//     for (const user of allUsers) {
//       const userId = user._id; // Id del usuario
//       const averageScore = await calculateSoftSkillsScore(userId); // Puntaje promedio
//       overallSoftSkillsScores[userId] = averageScore; // Almacenar el puntaje promedio en el objeto
//     }

//     return overallSoftSkillsScores;
//   } catch (error) {
//     console.log(error);
//     throw new Error("Internal server error");
//   }
// };

// // Calcular puntuación general de habilidades técnicas
// export const calculateOverallTechnicalSkillsScore = async (userId) => {
//   const userScores = await UserScore.find({
//     userId,
//     technicalSkillId: { $exists: true },
//   });

//   if (userScores.length === 0) {
//     return 0;
//   }

//   const sum = userScores.reduce((total, score) => total + score.score, 0);
//   const average = sum / userScores.length;

//   return average;
// };
export const calculateCombinedScoreAverage = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Calculating combined score for user with ID:", userId);

    // Buscar los documentos que coinciden con el userId
    const userResponses = await Response.find({ userId });

    console.log("User responses found:", userResponses);

    if (userResponses.length === 0) {
      console.log("No responses found for user with ID:", userId);
      return res.json({ averageScore: 0 });
    }

    // Calcular el promedio de las puntuaciones
    let totalScore = 0;
    let validScoresCount = 0;
    
    for (const response of userResponses) {
      for (const answer of response.answers) {
        if (answer.score !== undefined) {
          totalScore += answer.score;
          validScoresCount++;
        }
      }
    }
    
    if (validScoresCount === 0) {
      console.log("Warning: Total score is 0 for user with ID:", userId);
      return res.json({ averageScore: 0 });
    }

    const averageScore = totalScore / validScoresCount;

    console.log("Calculated average score:", averageScore);

    return res.json({ averageScore });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al calcular la puntuación combinada" });
  }
};


// Obtener ranking de miembros por puntuación de habilidades blandas
// export const getSoftSkillsRanking = async () => {
//   const pipeline = [
//     {
//       $match: { category: "soft" },
//     },
//     {
//       $group: {
//         _id: "$userId",
//         score: { $avg: "$score" },
//       },
//     },
//     {
//       $sort: { score: -1 },
//     },
//   ];

//   const rankedMembers = await UserScore.aggregate(pipeline);

//   return rankedMembers;
// };

// Obtener ranking de miembros por puntuación de habilidades técnicas
// export const getTechnicalSkillsRanking = async () => {
//   const pipeline = [
//     {
//       $match: { category: "technical" },
//     },
//     {
//       $group: {
//         _id: "$userId",
//         score: { $avg: "$score" },
//       },
//     },
//     {
//       $sort: { score: -1 },
//     },
//   ];

//   const rankedMembers = await UserScore.aggregate(pipeline);

//   return rankedMembers;
// };
