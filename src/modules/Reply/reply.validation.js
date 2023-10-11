import joi from 'joi';
import {commonFields} from "../../middleweres/validation.js";

export const create = {
    params: joi.object().required().keys({
        commentId: commonFields.id.required()
    }),
    body: joi.object().required().keys({
        reply: joi.string().required()
    }),
    query: joi.object().required().keys({}),
}
export const update = {
    params: joi.object().required().keys({
        replyId: commonFields.id.required()
    }),
    body: joi.object().required().keys({
        reply: joi.string().required()
    }),
    query: joi.object().required().keys({}),
}
const replyId_from_params = {
    params: joi.object().required().keys({
        replyId: commonFields.id.required()
    }),
    body: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}
export const deleteReply = replyId_from_params
export const like_or_unlike = replyId_from_params

