import {StatusCodes} from "http-status-codes";
import User from "../../../../database/models/User.js";
import bcrypt from "bcryptjs";
import * as CryptoJS from 'crypto-js';
import {sendCodeToEmail} from "../../../utils/userConfirmation.js";
import cloudinary from "cloudinary";
import {ErrorClass} from "../../../utils/ErrorClass.js";


// Get User Profile Controller: Handles getting user profile
export const getUserProfile = async (req, res, next) => {
    const {id} = req.params;
    const user = await User.findOne({
        _id: id,
        isDeleted: {$ne: true}
    }).select('-password -phone -emailConfirmationCode -resetPasswordCode -confirmEmail -isDeleted');
    if (!user) {
        return next(new ErrorClass("User not found"), StatusCodes.NOT_FOUND)
    }
    return res.status(StatusCodes.OK).json({message: 'done', user});
}


// Update User Controller: Handles updating user profile info (email, phone, password)
export const updateUserProfile = async (req, res, next) => {
    const {_id} = req.user._id;
    let user = await User.findById(_id);
    if (!user) {
        return next(new ErrorClass("User not found"), StatusCodes.NOT_FOUND)
    }
    if (req.body.email) {
        const emailExists = await User.findOne({email: req.body.email});
        if (emailExists) {
            return next(new ErrorClass("Email already exists"), StatusCodes.BAD_REQUEST)
        }
        user = await sendCodeToEmail(user, 'emailConfirmationCode', "Confirm Email");
    }
    if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, process.env.SALT_ROUNDS);
    }
    if (req.body.phone) {
        req.body.phone = await CryptoJS.AES.encrypt(req.body.phone, process.env.ENCRYPTION_KEY).toString();
    }
    user = await User.findByIdAndUpdate(_id, {$set: req.body}, {new: true});
    return res.status(StatusCodes.OK).json({message: 'done', user});
}


// Update User Profile Photo Controller: Handles updating current user profile photo
export const updateUserProfilePhoto = async (req, res, _) => {
    const user = await User.findById(req.user._id);
    await cloudinary.uploader.destroy(user.profilePhoto.public_id);
    const {secure_url, public_id} = await cloudinary.uploader.upload(
        req.file.path,
        {folder: `social-media/users/${req.user._id}`}
    );
    user.profilePhoto = {secure_url, public_id};
    await user.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
};


// Add new cover photo controller: Handles adding new cover photo to the coverPhotos array
export const addUserCoverPhoto = async (req, res, _) => {
    const user = await User.findById(req.user._id);
    const {secure_url, public_id} = await cloudinary.uploader.upload(
        req.file.path,
        {folder: `social-media/users/${req.user._id}`}
    );
    user.coverPhotos.unshift({secure_url, public_id});
    await user.save()
    return res.status(StatusCodes.OK).json({message: 'done'});
};


// Soft Delete Controller: Handles user soft delete
export const softDeleteUser = async (req, res, _) => {
    req.user.isDeleted = true
    await req.user.save()
    return res.status(StatusCodes.OK).json({message: 'done'});
};

