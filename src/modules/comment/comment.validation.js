import joi from "joi";
import { generalFeild } from "../../middleware/validation.middleware.js";

if (!generalFeild.Id || !generalFeild.file) {
    throw new Error("generalFeild.Id or generalFeild.file is not defined properly.");
}

export const createComment = joi.object({
    postId: generalFeild.Id.required(),
    commentId: generalFeild.Id,
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items(generalFeild.file)
}).or('content', 'file');  

export const updateComment = joi.object({
    postId: generalFeild.Id.required(),
    commentId: generalFeild.Id.required(),
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items(generalFeild.file)
}).or('content', 'file');

export const freezeComment = joi.object({
    commentId: generalFeild.Id.required(),
    postId: generalFeild.Id.required()
});

export const unFreezeComment = joi.object({
    commentId: generalFeild.Id.required(),
    postId: generalFeild.Id.required()
});
