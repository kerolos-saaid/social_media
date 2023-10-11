// Import necessary modules from mongoose.
import { Schema, Types, model } from "mongoose";

// Define the reply schema.
const replySchema = new Schema(
    {
        // Store the reply text.
        reply: { type: String,required:true },
        // Reference to the user who created the reply.
        createdBy: { type: Types.ObjectId, ref: "User",required: true },
        // Reference to the comment this reply belongs to.
        commentId: { type: Types.ObjectId, ref: "Comment",required: true },
        // Store the user IDs who liked this reply.
        likes: [{ type: Types.ObjectId, ref: "User" }],
    },
    {
        // Automatically track creation and update timestamps.
        timestamps: true,
    }
);





// Create a 'Reply' model using the defined schema.
const Reply = model("Reply", replySchema);

// Export the 'Reply' model.
export default Reply;
