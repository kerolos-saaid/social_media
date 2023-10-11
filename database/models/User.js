import {Schema, model} from "mongoose";

// Define the confirmationCode schema
const confirmationCode = new Schema(
    {
        code: {type: String, required: true},
        expireDate: {type: Date, required: true},
        _id:false
    }
)


// Define the user schema
const userSchema = new Schema(
    {
        name: {
            type: String,
            minlength: [3, "Name should be at least 3 characters long."],
            maxlength: [35, "Name should not exceed 20 characters."],
        },
        firstName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            unique: [true, "Email already in use."],
            required: [true, "Email is required."],
        },
        password: {
            type: String,
            required: [true, "Password is required."],
        },
        phone: {
            type: String,
        },
        confirmEmail: {
            type: Boolean,
            default: false,
        },
        emailConfirmationCode:confirmationCode,
        resetPasswordCode:confirmationCode,
        isDeleted: {
            type: Boolean,
            default: false,
        },
        profilePhoto: {
            type: Object,
        },
        coverPhotos: [
            {
                type: Object,
            },
        ],
        DOB: Date,
    },
    {
        timestamps: true, // Automatically add 'createdAt' and 'updatedAt' fields
    }
);

// Pre-save middleware to split 'name' into 'firstName' and 'lastName'
userSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        const nameParts = this.name.split(" ");
        this.firstName = nameParts[0];
        this.lastName = nameParts.slice(1).join(" ");
        this.name = undefined;
    }
    next();
});

// Create the User model using the user schema
const User = model("User", userSchema);

export default User;
