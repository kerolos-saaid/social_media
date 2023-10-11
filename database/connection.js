// Import the Mongoose library for MongoDB interaction.
import mongoose from "mongoose";

/**
 * Connect to the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the connection is successful or rejects on error.
 */
const connectToDatabase = async () => {
    // Get the database URI from environment variables.
    const dbURI = process.env.DB_LOCAL || process.env.DB_ONLINE;

    try {
        // Attempt to establish a connection to the database.
        await mongoose.connect(dbURI);
        console.log(`Connected to the database successfully at ${dbURI}`);
    } catch (error) {
        // Handle and log connection errors.
        console.error(`Failed to connect to the database\nError: ${error}`);
        throw error; // Re-throw the error to indicate a failed connection.
    }
};

// Export the connectToDatabase function.
export default connectToDatabase;
