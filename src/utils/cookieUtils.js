import jwt from "jsonwebtoken";

export const extractTokenFromCookie = (cookieString) => {
  const cookies = {};
  cookieString.split(";").forEach((cookie) => {
    const [key, value] = cookie.split("=");
    cookies[key.trim()] = value.trim();
  });
  return cookies.token;
};

export const decodeToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    return decodedToken;
  } catch (error) {
    // Manejo del error si el token es inválido o expirado
    console.error(error);
    return null;
  }
};
