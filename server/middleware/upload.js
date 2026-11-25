const multer = require("multer");

// Store uploaded file temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
});

module.exports = upload;