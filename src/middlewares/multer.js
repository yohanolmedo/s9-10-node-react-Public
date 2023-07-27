import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\.[^/.]+$/, ""));
  },
});
/* 
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}; */
const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype;
  const allowedMimetypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedMimetypes.includes(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("El formato de imagen no es válido."));
  }
};
const upload = multer({
  storage,
  fileFilter,
});

export default upload;
