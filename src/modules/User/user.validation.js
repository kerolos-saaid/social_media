import joi from "joi";
import {commonFields} from "../../middleweres/validation.js";



export const getUserProfile = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({id: commonFields.id.required()}),
    query: joi.object().required().keys({}),
};

export const updateUserProfile = {
    body: joi.object().required().keys(
        {
            name: commonFields.name,
            email: commonFields.email,
            phone: commonFields.phone,
        }
    ),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}

export const update_or_add_Photo = {
    body: joi.object().required().keys({}),
    file: commonFields.file.required(),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}

export const softDeleteUser = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}
