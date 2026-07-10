const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'fdcuic/mobilite',
      resource_type: 'auto',
      public_id: `mobilite_${file.fieldname}_${Date.now()}`,
    };
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