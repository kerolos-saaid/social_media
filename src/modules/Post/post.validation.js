import joi from "joi";
import {commonFields} from "../../middleweres/validation.js";




export const like_unlike_Post = {
    params: joi.object().required().keys({
        postId: commonFields.id.required()
    }),
    body: joi.object().required().keys({}),
    query: joi.object().required().keys({})
};


export const deletePost = {
    params: joi.object().required().keys({
        postId: commonFields.id.required()
    }),
    body: joi.object().required().keys({}),
    query: joi.object().required().keys({})
};

export const getAllPosts = {
    params: joi.object().required().keys({}),
    body: joi.object().required().keys({}),
    query: joi.object().required().keys({
        page: joi.number(),
        size: joi.number(),
        sort: joi.string(),
        fromDay: joi.date(),
        toDay: joi.date(),
    })
};


export const getPost = {
    params: joi.object().required().keys({
        postId: commonFields.id.required()
    }),
    body: joi.object().required().keys({}),
    query: joi.object().required().keys({})
};


export const create = {
    params: joi.object().required().keys({}),
    body: joi.object().required().keys({
        content: joi.string().required(),
    }),
    files: joi.object().required().keys({
        photos: joi.array().items(commonFields.file.required()).max(25),
        videos: joi.array().items(commonFields.file.required()).max(5),
    }),
    query: joi.object().required().keys({})
};


export const updatePost = {
    params: joi.object().required().keys({
        postId: commonFields.id.required()
    }),
    body: joi.object().required().keys({
        content:joi.string(),
        deleteMedia:joi.custom((value, _) => JSON.parse(value))
    }),
    query: joi.object().required().keys({}),
    files: joi.object().required().keys({
        photos: joi.array().items(commonFields.file.required()).max(25),
        videos: joi.array().items(commonFields.file.required()).max(5),
    }),
};