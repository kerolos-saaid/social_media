import {Types} from "mongoose";
import joi from 'joi';


const dataMethods = ["body", "params", "query", "headers", "file", "files"];

const validateObjectId = (value, helper) =>
    Types.ObjectId.isValid(value) ? true : helper.message("Invalid objectId");



export const commonFields = {
    email: joi
        .string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 4,
            tlds: {allow: ["com", "net"]},
        }),
    password: joi.string(),
    confirmPassword: joi.ref("password"),
    id: joi.string().custom(validateObjectId),
    name: joi.string(),
    phone: joi.string(),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required(),
    }),
    jwtToken: joi.string(),
    nanoid: joi.string().length(6),
};

export const validation = (schema) => {
    return (req, res, next) => {
        const validationErr = [];

        dataMethods.forEach((key) => {
            if (schema[key]) {
                const validationResult = schema[key].validate(req[key], {
                    abortEarly: false,
                });
                if (validationResult.error) {
                    validationErr.push(validationResult.error.details);
                }
            }
        });

        if (validationErr.length) {
            return res.status(400).json({message: "Validation Error", validationErr});
        }
        return next();
    };
};
