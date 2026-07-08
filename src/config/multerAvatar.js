const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const path = require('path');

const storageAvatar = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    return {
      folder: 'fdcuic/avatars',
      resource_type: 'image',
      public_id: `avatar_${req.user?.id}_${Date.now()}`,
      format: ext.replace('.', ''),
      transformation: [{ width: 500, height: 500, crop: 'fill' }] // Optimisation
    };
  },
});

const uploadAvatar = multer({
  storage: storageAvatar,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non autorisé. JPG, PNG ou WEBP uniquement.'), false);
    }
  },
});

module.exports = { uploadAvatar };
