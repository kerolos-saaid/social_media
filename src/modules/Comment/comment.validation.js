import joi from 'joi';
import {commonFields} from "../../middleweres/validation.js";

export const create = {
    params: joi.object().required().keys({
        postId: commonFields.id.required()
    }),
    body: joi.object().required().keys({
        comment: joi.string().required()
    }),
    query: joi.object().required().keys({}),
}
export const update = {
    params: joi.object().required().keys({
        commentId: commonFields.id.required()
    }),
    body: joi.object().required().keys({
        comment: joi.string().required()
    }),
    query: joi.object().required().keys({}),
}
const commentId_from_params = {
    params: joi.object().required().keys({
        commentId: commonFields.id.required()
    }),
    body: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}
export const deleteComment = commentId_from_params
export const like_or_unlike = commentId_from_params

