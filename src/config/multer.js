const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination:  (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `projet_${timestamp}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF sont acceptés.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits:{fileSize:15*1024*1024}
});// 15 Mo max

module.exports = upload;