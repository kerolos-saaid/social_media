import User from "../../../../../database/models/User.js";
import {StatusCodes} from "http-status-codes";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";
import cloudinary from "../../../../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import {ErrorClass} from "../../../../utils/ErrorClass.js";
import {nanoid} from "nanoid";
import {sendCodeToEmail} from "../../../../utils/userConfirmation.js";


// Signup Controller: Handles user registration
export const signup = async (req, res, _) => {
    const {phone, email} = req.body;

    // Check if a user with the provided email or phone number already exists
    const existingUser = await User.findOne({$or: [{email}, {phone}]});

    if (existingUser?.email === email) {
        // If the email is already registered, return a bad request response
        return res.status(StatusCodes.BAD_REQUEST).json({message: 'Email already registered'});
    } else {
        // Create a new user instance with the request body
        let newUser = new User(req.body);

        // Hash the user's password using bcrypt with the specified salt rounds
        newUser.password = bcrypt.hashSync(newUser.password, Number(process.env.SALT_ROUNDS));

        // Encrypt the user's phone number using CryptoJS
        newUser.phone = CryptoJS.AES.encrypt(newUser.phone, process.env.ENCRYPTION_KEY).toString();

        if (req.files.profilePhoto) {
            // Upload and set the user's profile photo
            const {secure_url, public_id} = await cloudinary.uploader.upload(
                req.files.profilePhoto[0].path,
                {folder: `social-media/users/${newUser._id}`}
            );
            newUser.profilePhoto = {secure_url, public_id};
        }

        if (req.files.coverPhoto) {
            // Upload and add the user's cover photo(s)
            for (const coverPhoto of req.files.coverPhoto) {
                const {secure_url, public_id} = await cloudinary.uploader.upload(
                    coverPhoto.path,
                    {folder: `social-media/users/${newUser._id}`}
                );
                newUser.coverPhotos.push({secure_url, public_id});
            }
        }

        // Send confirmation code to email and save it to database
        newUser = await sendCodeToEmail(newUser, 'emailConfirmationCode', "Confirm Email");
        // Save the new user to the database
        const savedUser = await newUser.save();

        // Return a success response with a message and the created user object
        return res.status(StatusCodes.CREATED).json({message: 'done', user: savedUser});
    }
};

// SignIn Controller: Handles user login
export const signin = async (req, res, _) => {
    let {email, password} = req.body;
    email = email.toLowerCase();

    // Find the user with the provided email
    let existingUser = await User.findOne({email});

    // If user is not found, check if the user's email is in the database
    if (!existingUser) {
        return res.status(StatusCodes.BAD_REQUEST).json({message: 'Email not registered'});
    }

    // If the user is deleted, change status to not deleted
    if (existingUser.isDeleted) {
        existingUser.isDeleted = false;
        await existingUser.save();
    }

    if (existingUser) {
        // Check if the provided password matches the user's hashed password
        const passwordMatch = bcrypt.compareSync(password, existingUser.password);

        if (passwordMatch) {
            // Generate a refresh token and an access token
            const refreshToken = jwt.sign({id: existingUser._id}, process.env.REFRESH_JWT_SECRET, {expiresIn: '30d'});
            const accessToken = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET, {expiresIn: '10m'});

            //
            if (!existingUser.confirmEmail) {
                // check if the code is expired
                if (new Date(existingUser.emailConfirmationCode.expireDate).getTime() < new Date().getTime()) {
                    // generate new code
                    await sendCodeToEmail(existingUser, 'emailConfirmationCode', "Confirm Email");
                }
            }

            // Return a success response with a message, refresh token, and access token
            return res.status(StatusCodes.OK).json({message: 'done', refreshToken, accessToken});
        } else {
            // If the password is incorrect, return a bad request response
            return res.status(StatusCodes.BAD_REQUEST).json({message: 'Incorrect password'});
        }
    } else {
        // If the user is not found, return a bad request response
        return res.status(StatusCodes.BAD_REQUEST).json({message: 'User not found'});
    }
};

// Refresh Controller: Handles token refresh
export const refresh = async (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        // If no refresh token is provided, return a forbidden response
        return res.status(StatusCodes.FORBIDDEN).json({message: 'No refresh token provided'});
    }

    // Verify the refresh token and extract the user ID
    const {id} = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    // Check if the user with the extracted ID exists
    const userExists = await User.findById(id);

    if (!userExists) {
        // If the user does not exist, return a forbidden response
        return next(new ErrorClass('Invalid refresh token', StatusCodes.FORBIDDEN));
    }

    // Generate a new access token and return it
    const accessToken = jwt.sign({id: userExists._id}, process.env.JWT_SECRET);
    return res.status(StatusCodes.OK).json({message: 'done', accessToken});
}

// Confirm Email Controller: Handles email confirmation
export const confirmEmail = async (req, res, next) => {
    const {code} = req.body;
    if (req.user.confirmEmail) {
        return next(new ErrorClass('Email already confirmed', StatusCodes.BAD_REQUEST));
    } else if ((code === req.user.emailConfirmationCode.code) && new Date(req.user.emailConfirmationCode.expireDate).getTime() > new Date().getTime()) {
        req.user.confirmEmail = true;
        req.user.resetPasswordCode = {code: nanoid(6), expireDate: new Date().toISOString()};
        await req.user.save();
        return res.status(StatusCodes.OK).json({message: 'Email confirmed'});
    }
    return next(new ErrorClass('Invalid code', StatusCodes.BAD_REQUEST));
}

// Forget Password Controller: Handles sending email the reset password code
export const forgetPassword = async (req, res, _) => {
    const {email} = req.body;

    // Check if the user with the provided email exists
    let userExists = await User.findOne({email});

    if (!userExists) {
        // If the user does not exist, return a bad request response
        return res.status(StatusCodes.BAD_REQUEST).json({message: 'Email not registered'});
    }

    // Generate a new code and save it to the database
    await sendCodeToEmail(userExists, 'resetPasswordCode', "Forget Password");

    // Return a success response with a message
    return res.status(StatusCodes.OK).json({message: 'done'});
}

// Reset Password Controller: Handles resetting password by the reset code
export const resetPassword = async (req, res, next) => {
    const {email, code, newPassword, confirmNewPassword} = req.body
    const userExists = await User.findOne({email});
    if (newPassword !== confirmNewPassword) {
        return next(new ErrorClass('Passwords do not match', StatusCodes.BAD_REQUEST));
    }
    if (bcrypt.compareSync(newPassword, userExists.password)) {
        return next(new ErrorClass('New password cannot be the same as the old password', StatusCodes.BAD_REQUEST));
    }
    if (!userExists) {
        return next(new ErrorClass('Email not registered', StatusCodes.BAD_REQUEST));
    }
    if (code === userExists.resetPasswordCode.code && new Date(userExists.resetPasswordCode.expireDate).getTime() > new Date().getTime()) {
        userExists.password = bcrypt.hashSync(newPassword, Number(process.env.SALT_ROUNDS));
        userExists.resetPasswordCode = {code: nanoid(6), expireDate: new Date().toISOString()};
        await userExists.save()
        return res.status(StatusCodes.OK).json({message: 'done'});
    }
    return next(new ErrorClass('Invalid Code', StatusCodes.BAD_REQUEST));
}
export const updatePassword = (req, res, next) => {
    const {newPassword, confirmNewPassword} = req.body;
    if (newPassword !== confirmNewPassword) {
        return next(new ErrorClass('Passwords do not match', StatusCodes.BAD_REQUEST));
    }
    if (bcrypt.compareSync(newPassword, req.user.password)) {
        return next(new ErrorClass('New password cannot be the same as the old password', StatusCodes.BAD_REQUEST));
    }

    req.user.password = bcrypt.hashSync(newPassword, Number(process.env.SALT_ROUNDS));
    req.user.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
};