import { Router } from "express";
import * as validators from "./comment.validation.js"
import * as commentService from "./service/comment.service.js"
import { fileValidation } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { endPoint } from "./comment.authorization.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { authorization } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router({

    mergeParams: true,
    caseSensitive: true,
})

router.post('/', authentication(), authorization(endPoint.User), uploadCloudFile(fileValidation.image).array('attachment', 2), validation(validators.createComment), commentService.createComment)
router.post('/:commentId', authentication(), authorization(endPoint.User), uploadCloudFile(fileValidation.image).array('attachment', 2), validation(validators.createComment), commentService.createComment)

router.patch('/update/:commentId', authentication(), authorization(endPoint.User), uploadCloudFile(fileValidation.image).array('attachment', 2), validation(validators.updateComment), commentService.updateComment)
router.patch('/unFreeze/:commentId', authentication(), authorization(endPoint.UserAndAdmin), validation(validators.unFreezeComment), commentService.unFreezeComment)

router.delete('/freeze/:commentId', authentication(), authorization(endPoint.UserAndAdmin), validation(validators.freezeComment), commentService.freezeComment)

export default router