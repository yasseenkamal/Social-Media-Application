import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from '../../../DB/db.service.js'
import userModel, { roleTypes } from "../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { postModel } from "../../../DB/model/Post.model.js";
import { friendRequetModel } from "../../../DB/model/FriendRequest.model.js";

export const sendFriendRequest = asyncHandler(async (req, res, next) => {

    const { friendId } = req.params;
    const checkUser = await dbService.findOne({
        model: userModel,
        filter: { _id: friendId, isDeleted: { $exists: false } }
    })
    if (!checkUser) {
        return next(new Error('Not Found', { cause: 404 }))
    }
    const friendRequest = await dbService.create({
        model: friendRequetModel,
        data: {
            friendId,
            createdBy: req.user._id
        }
    })
    return successResponse({ res, status: 201, data: { friendRequest } })

})

export const acceptFriendRequest = asyncHandler(async (req, res, next) => {

    const { friendRequestId } = req.params;

    const friendRequest = await dbService.findOneAndDelete({
        model: friendRequetModel,
        filter: {
            _id: friendRequestId,
            status: false,
            friendId: req.user._id
        }
    })
    await dbService.updateOne({
        model: userModel,
        filter: {
            _id: req.user._id
        },
        data: {
            $addToSet: { friends: friendRequest.createdBy }
        }
    })

    await dbService.updateOne({
        model: userModel,
        filter: {
            _id: friendRequest.createdBy
        },
        data: {
            $addToSet: { friends: req.user._id }
        }
    })
    return successResponse({ res, status: 200, data: {} })

})

export const dashBoard = asyncHandler(async (req, res, next) => {

    const result = await Promise.allSettled([await dbService.find({
        model: postModel,
        filter: {},
    }), dbService.find({
        model: userModel,
        filter: {},
        populate: [
            {
                path: "viewers.userId",
                select: "userName image"
            },

        ]
    })
    ])

    return successResponse({ res, data: { result } })

})

export const profile = asyncHandler(async (req, res, next) => {
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id },
        populate: [
            {
                path: "friends",
                select: "userName image"
            },

        ]
    })
    return successResponse({ res, data: { user } })

})

export const changeRoles = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.body;

    const roles = req.user.role === roleTypes.superAdmin ? { role: { $nin: [roleTypes.superAdmin] } } : { role: { $nin: [roleTypes.admin, roleTypes.superAdmin] } }
    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: userId,
            isDeleted: { $exists: false },
            ...roles
        },
        data: {
            role,
            updatedBy: req.user._id
        },
        options: { new: true }
    })
    return successResponse({ res, data: { user } })

})


export const updateProfile = asyncHandler(async (req, res, next) => {
    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: req.body,
        options: { new: true }
    })
    return successResponse({ res, data: { user } })

})

export const updateProfileImage = asyncHandler(async (req, res, next) => {

    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}}/'user'/${req.user._id}/profile` })
    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            image: { secure_url, public_id }
        },
        options: { new: false }
    })
    if (user.image?.public_id) {
        await cloud.uploader.destroy(user.image.public_id)
    }
    return successResponse({ res, data: { user } })

})


export const updateProfileCoverImage = asyncHandler(async (req, res, next) => {

    let images = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `${process.env.APP_NAME}}/'user'/${req.user._id}/profile/cover` })
        images.push({ secure_url, public_id })
    }

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            coverImages: images
        },
        options: { new: true }
    })
    return successResponse({ res, data: { file: req.files } })

})


export const shareProfile = asyncHandler(async (req, res, next) => {
    const { profileId } = req.params;
    let user = null
    if (profileId === req.user._id.toString()) {

    } else {

        user = await dbService.findOneAndUpdate({
            model: userModel,
            filter: { _id: profileId, isDeleted: false },
            data: {
                $push: { viewers: { userId: req.user._id, time: Date.now() } }
            },
            options: { new: true },
            select: "userName image email"
        })
    }
    return user ? successResponse({ res, data: { user } }) : next(new Error("In-Valid Account ", { cause: 404 }))

})



export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body

    if (await dbService.findOne({
        model: userModel,
        filter: { email }
    })) {
        return next(new Error('email exist', { cause: 409 }))
    }
    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            tempEmail: email
        }
    })

    emailEvent.emit('sendConfirmEmail', { id: req.user._id, email: req.user.email })// sending OTP to old account
    emailEvent.emit("updateEmail", { id: req.user._id, email })  // sending OTP to  new email 

    return successResponse({ res, message: "check  MailBox in 2 emails", data: {}, });
});


export const resetEmail = asyncHandler(async (req, res, next) => {
    const { oldCode, newCode } = req.body;

    if (!compareHash({ plaintext: oldCode, hashValue: req.user.confirmEmailOtp })
        ||
        !compareHash({ plaintext: newCode, hashValue: req.user.tempEmailOtp })
    ) {
        return next(new Error('invalid provided code ', { cause: 400 }))
    }

    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            email: req.user.tempEmail,
            changeCridentialsTime: Date.now(),
            $unset: {
                tempEmail: 0,
                tempEmailOtp: 0,
                confirmEmailOtp: 0,
            }
        }
    })
    return successResponse({ res, message: "Email updated successfully", data: {}, });
})


export const updatePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, password } = req.body;

    if (!compareHash({ plaintext: oldPassword, hashValue: req.user.password })

    ) {
        return next(new Error('invalid old  password ', { cause: 400 }))
    }

    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            password: generateHash({ plaintext: password }),
            changeCridentialsTime: Date.now(),

        }
    })
    return successResponse({ res, message: "Password updated successfully", data: {}, });
})

