// Import necessary modules and middleware.
import {StatusCodes} from "http-status-codes";
import connectToDatabase from "../database/connection.js";
import userRouter from "./modules/User/user.router.js";
import postRouter from "./modules/Post/post.router.js";
import {globalErrorHandling} from "./utils/errorHandling.js";
import cors from "cors"
import commentRouter from "./modules/Comment/comment.router.js";
import {sendCodeToEmail} from "./utils/userConfirmation.js";
import User from "../database/models/User.js";
import cron from "node-cron";
import replyRouter from "./modules/Reply/reply.router.js";

// Define the bootstrap function that initializes the Express app.
const bootstrap = (app, express) => {
    // Enable parsing JSON data in requests.
    app.use(express.json());

    // Enable Cross-Origin Resource Sharing (CORS) for API access.
    app.use(cors());

    // Setup API Routing for all modules.
    app.use(`/user`, userRouter);
    app.use(`/post`, postRouter);
    app.use(`/comment`, commentRouter);
    app.use(`/reply`, replyRouter);

    // Respond to invalid routes with a "Not Found" status and a message.
    app.all("*", (req, res, next) => {
        res.status(StatusCodes.NOT_FOUND).json({message: "Invalid routing"});
    });

    // Apply global error handling middleware.
    app.use(globalErrorHandling);

    // Cron job to reminder users to confirm their email addresses every day at 9pm.
    const job = cron.schedule('0 21 * * *', async () =>{
                console.log('cron job working')
                const users = await User.find({
                    isEmailConfirmed: false,
                    isDeleted: false
                }).select('email confirmEmail emailConfirmationCode');
                await Promise.all(
                    users.map(async (user) => {
                            return await sendCodeToEmail(user, 'emailConfirmationCode', 'Confirm email reminder')
                        }
                    )
                )
        },
        null,
        true,
    )

    // Connect to the database.
    connectToDatabase();
};

// Export the bootstrap function.
export default bootstrap;
