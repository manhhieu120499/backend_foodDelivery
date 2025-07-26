const multer = require('multer')

const storage = multer.memoryStorage()

function checkMineType(req, file, cb) {
    const fileType = ['png','jpeg','jpg','gif']
    const mimeType = fileType.includes(file.mimetype.split("/")[1])
    if(file || mimeType) {
        return cb(null, true) // tham số thứ 2 == true cho phép lưu file
    }
    return cb(new Error("Only receive image"))
}

const upload = multer({
    storage,
    limits: 1024 * 1024 * 2,
    fileFilter: (req, file, cb) => {
        checkMineType(req, file, cb)
    }
}).single('image')

function conditionalUpload(req, res, next) {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        upload(req, res, function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    } else {
        next();
    }
}

module.exports = {upload, conditionalUpload}