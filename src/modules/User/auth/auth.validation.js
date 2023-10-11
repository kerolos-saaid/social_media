import joi from "joi";
import {commonFields} from "../../../middleweres/validation.js";


// Define validation schemas for different routes
const commonValidation = {
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
};


export const forgetPassword = {
    ...commonValidation,
    body: joi.object().required().keys({email: commonFields.email.required()}),
};
export const confirmEmail = {
    ...commonValidation,
    body: joi.object().required().keys(
        {
            code: commonFields.nanoid.required(),
        }
    ),
};
export const signup = {
    ...commonValidation,
    body: joi.object().required().keys({
        name: commonFields.name.required(),
        email: commonFields.email.required(),
        password: commonFields.password.required(),
        confirmPassword: joi.ref("password"),
        phone: commonFields.phone.required(),
        DOB: joi.date().required(),
    }),
    files: joi.object().required().keys({
        profilePhoto: joi.array().items(commonFields.file.required()).required().max(1),
        coverPhoto: joi.array().items(commonFields.file.required()).max(1),
    }),
};
export const signin = {
    ...commonValidation,
    body: joi.object().required().keys({
        email: commonFields.email.required(),
        password: commonFields.password.required(),
    }),
};
export const refresh = {
    ...commonValidation,
    body: joi.object().required().keys({
        refreshToken: commonFields.jwtToken.required(),
    }),
};
export const updatePassword = {
    ...commonValidation,
    body: joi.object().required().keys({
        newPassword: commonFields.password.required(),
        confirmNewPassword: joi.ref("newPassword"),
    }),
};
export const resetPassword = {
    ...commonValidation,
    body: joi.object().required().keys(
        {
            email: commonFields.email.required(),
            code: commonFields.nanoid.required(),
            newPassword: commonFields.password.required(),
            confirmNewPassword: joi.ref("newPassword"),
        }
    ),
};
