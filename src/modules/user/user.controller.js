import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import * as profileService from './service/user.service.js'
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js"
import { fileValidation, uploadFileDisk } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { endPoint } from "./user.authorization.js";
const router = Router()

router.patch("/profile/friends/:friendId",authentication(),profileService.sendFriendRequest)
router.patch("/profile/friends/:friendRequestId/accept",authentication(),profileService.acceptFriendRequest)
router.get("/profile", authentication(), profileService.profile)
router.get("/profile/dashBoard", authentication(), profileService.dashBoard)
router.get("/profile/:profileId", validation(validators.shareProfile), authentication(), profileService.shareProfile)


router.patch("/:userId/profile/dashBoard/role", authentication(), authorization(endPoint.changeRoles), profileService.changeRoles)
router.patch("/profile", validation(validators.updateProfile), authentication(), profileService.updateProfile)
router.patch("/profile/image",
    authentication(),
    uploadCloudFile(fileValidation.image).single('image'),
    profileService.updateProfileImage)

router.patch("/profile/image/cover",
    authentication(),
    uploadFileDisk("user/profile", fileValidation.image).array('image', 3),
    profileService.updateProfileCoverImage)


router.patch("/profile/email", validation(validators.updateEmail), authentication(), profileService.updateEmail)
router.patch("/profile/reset-email", validation(validators.resetEmail), authentication(), profileService.resetEmail)
router.patch("/profile/reset-password", validation(validators.updatePassword), authentication(), profileService.updatePassword)





export default router