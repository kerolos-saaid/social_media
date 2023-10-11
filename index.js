// Import necessary modules.
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the current directory using Node.js modules.
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from a .env file in the config directory.
dotenv.config({ path: path.join(__dirname, "./config/.env") });

// Import the Express framework.
import express from "express";

// Import the bootstrap function from the index router file.
import bootstrap from "./src/index.router.js";
import jwt from "jsonwebtoken";
import Post from "./database/models/Post.js";

// Create an Express server.
const app = express();

// Define the port for the server, defaulting to 5000 if not specified.
const port = process.env.PORT || 5000;

// Initialize the application by calling the bootstrap function.
bootstrap(app, express);

// Start the server and listen on the specified port.
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

