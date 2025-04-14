import joi from 'joi'
import { generalFeild } from '../../middleware/validation.middleware.js'



export const createPost = joi.object().keys({
    content: joi.string().min(2).max(50000).trim(),
    file: joi.object().options({ allowUnknown: true })

}).or('content', 'file')
export const updatePost = joi.object().keys({
    postId: generalFeild.Id.required(),
    content: joi.string().min(2).max(50000).trim(),
    file: joi.object().options({ allowUnknown: true })

}).or('content', 'file')

export const freezePost = joi.object().keys({
    postId: generalFeild.Id.required()

}).required()

export const undoPost = joi.object().keys({
    postId: generalFeild.Id.required()

}).required()

export const restorePost = joi.object().keys({
    postId: generalFeild.Id.required()

}).required()

export const archivePost = joi.object().keys({
    postId: generalFeild.Id.required()

}).required()

export const likePost = joi.object().keys({
    postId: generalFeild.Id.required(),
    action: joi.string().valid('like', 'unlike').default('like')

}).required()

export const likePostGraph=joi.object().keys({
    action:joi.string().valid('like','unLike'),
    postId:generalFeild.Id.required(),
    authorization:joi.string().required(),
    }).required()