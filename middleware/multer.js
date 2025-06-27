import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname + "_" + uuidv4())
    }
});

export const upload = multer({
    storage
});