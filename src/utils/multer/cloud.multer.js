import fs from "node:fs";
import path from "node:path"
import multer from "multer"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadCloudFile = (fileValidation = []) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {

            const uploadPath = path.join(__dirname, '..', 'uploads', 'tmp');
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {

            cb(null, Date.now() + '-' + file.originalname);
        }
    });

    function fileFilter(req, file, cb) {
        if (fileValidation.length > 0 && !fileValidation.includes(file.mimetype)) {
            return cb(new Error("Invalid file format", { cause: 400 }), false);
        }
        cb(null, true);
    }

    return multer({ storage, fileFilter });
};

// export const fileValidation = {
//     image: ['image/jpeg', 'image/png', 'image/gif'],
//     document: ['application/pdf', 'application/msword']
// }