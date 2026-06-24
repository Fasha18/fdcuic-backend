const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Storage Cloudinary pour les fichiers templates uploadés par l'admin
const storageTemplates = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'fdcuic/templates',
      resource_type: 'raw', // Pour Excel, Word, PDF
      public_id: `template_${file.fieldname}_${Date.now()}`,
      format: undefined, // Garder le format original
    };
  },
});

const uploadTemplate = multer({
  storage: storageTemplates,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non autorisé. PDF, Excel (.xlsx) ou Word (.docx) uniquement.'), false);
    }
  },
});

module.exports = { uploadTemplate };
