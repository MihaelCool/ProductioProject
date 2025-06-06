const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.mimetype.startsWith('image') || file.mimetype === 'application/pdf' ? 'uploads/drawings' : 'uploads/tap_files';
    const uploadPath = path.join(__dirname, folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Уникальное имя файла
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /image\/(png|jpeg|jpg)|application\/pdf/;
    const extname = allowedTypes.test(file.mimetype);
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Только файлы PNG, JPEG или PDF разрешены!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).array('files', 5); // До 5 файлов

module.exports = { upload };