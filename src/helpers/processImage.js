import { unlinkSync } from "fs";
import sharp from "sharp";
import { cloudinaryUpload } from "./cloudinaryUpload.js";

export const processImage = async (image) => {
  const { path, filename } = image;
  try {
    const optimizedImagePath = `public/images/${filename}.webp`;
    await sharp(path).webp({ quality: 75 }).toFile(optimizedImagePath);
    const imagePath = await cloudinaryUpload(optimizedImagePath);
    unlinkSync(optimizedImagePath);
    unlinkSync(path);
    return imagePath;
  } catch (error) {
    unlinkSync(path);
    throw error;
  }
};
