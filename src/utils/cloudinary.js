import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the current directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from a .env file
dotenv.config({ path: path.join(__dirname, '../../config/.env') });

import cloudinary from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.v2.config({
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    cloud_name: process.env.CLOUDINARY_NAME,
    secure: true, // Use secure connections
});

// Export the configured Cloudinary instance
export default cloudinary.v2;
