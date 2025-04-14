import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { authorization } from "../../middleware/auth.middleware.js";
import { endpoints } from "./post.authorization.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as postValidators from './post.validation.js'
import { fileValidation } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import * as postService from "./service/post.service.js";
import commentController from "../comment/comment.controller.js"

const router = Router()

router.use('/:postId/comment', commentController)

router.post("/",
    authentication(),
    authorization(endpoints.createPost),
    uploadCloudFile(fileValidation).array('attachments', 2),
    validation(postValidators.createPost),
    postService.createPost
)
router.patch("/update/:postId",
    authentication(),
    authorization(endpoints.createPost),
    uploadCloudFile(fileValidation).array('attachment', 2),
    validation(postValidators.updatePost),
    postService.updatedPost
)

router.patch('/undo/:postId', authentication(), authorization(endpoints.createPost), validation(postValidators.undoPost), postService.undoPost)
router.patch('/restore/:postId', authentication(), authorization(endpoints.createPost), validation(postValidators.restorePost), postService.restorePost)
router.patch('/archive/:postId', authentication(), authorization(endpoints.createPost), validation(postValidators.archivePost), postService.archivePost)
router.patch('/like/:postId', authentication(), authorization(endpoints.likePost), validation(postValidators.likePost), postService.likePost)


router.get('/posts', postService.publicPost)
router.get('/friends-posts', authentication(), authorization(endpoints.createPost), postService.friendsPosts)
router.get('/allPosts', authentication(), postService.getPosts)


router.delete("/freeze/:postId", authentication(), authorization(endpoints.freezePost), validation(postValidators.freezePost), postService.freezePost)


export default router 