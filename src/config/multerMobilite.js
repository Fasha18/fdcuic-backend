const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `mobilite_${file.fieldname}_${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const formatsAutorises = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (formatsAutorises.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format non autorisé. PDF, JPG ou PNG uniquement.'), false);
  }
};

const uploadMobilite = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max par fichier
});

module.exports = uploadMobilite;