// Import necessary modules and libraries
import multer from 'multer';
import path from "path";
import * as os from "os";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

// Define allowed file types for validation
export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    file: ['application/pdf', 'application/msword'],
    video: ['video/mp4']
};

// Define a function to handle file uploads
export function fileUpload(customValidation = []) {
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            // Generate a unique filename using nanoid and the file's extension
            cb(null, `${nanoid()}.${file.mimetype.split('/')[1]}`);
        },
    });

    // Define a function to filter files based on custom validation
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            // Allow the file if its mimetype is in the customValidation array
            cb(null, true);
        } else {
            // Reject the file if it doesn't match the allowed types
            cb('Invalid file format', false);
        }
    }

    // Return a multer instance with the defined storage and fileFilter
    return multer({ fileFilter, storage });
}
