import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import * as dbService from "../../../DB/db.service.js"
import { cloud } from "../../../utils/multer/cloudinary.multer.js"
import commentModel from "../../../DB/model/Comment.model.js"
import { postModel } from "../../../DB/model/Post.model.js"
import { roleTypes } from "../../../DB/model/User.model.js"


export const createComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params;

    if (!req.user?._id) {
        return next(new Error("Unauthorized: userId is required", { cause: 401 }));
    }

    if (commentId && !await dbService.findOne({ model: commentModel, filter: { _id: commentId, postId, isDeleted: { $exists: false } } })) {
        return next(new Error("In-valid parent comment"));
    }

    const post = await dbService.findOne({
        model: postModel,
        filter: { _id: postId, isDeleted: { $exists: false } }
    });
    if (!post) {
        return next(new Error("In-Valid post Id", { cause: 404 }));
    }

    if (req.files?.length) {
        const attachments = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/user/${post.createdBy}/post/${postId}/comment` });
            attachments.push({ secure_url, public_id });
        }
        req.body.attachments = attachments;
    }

    req.body.userId = req.user._id;

    const comment = await dbService.create({
        model: commentModel,
        data: {
            postId,
            createdBy: req.user._id,
            commentId,
            ...req.body,
        },
    });


    return successResponse({ res, status: 201, message: "Comment created successfully", data: { comment } });
});




export const updateComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params;

    const comment = await dbService.findOne({
        model: commentModel, filter: { _id: commentId, postId, isDeleted: { $exists: false } },
        populate: [{
            path: "postId"
        }]

    })
    if (!comment) {
        return next(new Error("Comment not found or unauthorized", { cause: 404 }));
    }

    let updatedData = { ...req.body };


    if (req.files?.length) {
        let attachments = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
                folder: `${process.env.APP_CLOUD_NAME}/user/${comment.createdBy}/post/${postId}/comment`
            });
            attachments.push({ secure_url, public_id });
        }
        updatedData.attachments = attachments;
    }


    const updatedComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, postId, isDeleted: { $exists: false } },
        data: updatedData,
        options: { new: true }
    });

    if (!updatedComment) {
        return next(new Error("Failed to update comment", { cause: 500 }));
    }

    return successResponse({ res, message: "Comment updated successfully", data: { updatedComment } });
});



export const freezeComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params
    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        populate: [{
            path: "postId"
        }]

    })
    if (
        !comment
        ||
        (
            comment.createdBy.toString() != req.user._id.toString()
            && comment.postId.createdBy.toString() != req.user._id.toString()
            && req.user.role != roleTypes.admin
        )
    ) {

        return next(new Error("In-Valid comment Id or not authorized account", { cause: 401 }))
    }

    if (!comment) {
        return next(new Error("comment not found", { cause: 404 }))
    }

    const freezedComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, postId, isDeleted: { $exists: false } },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id

        },
        options: { new: true }

    })

    return successResponse({ res, message: "comment deleted successfully", data: { freezedComment } })
})



export const unFreezeComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params
    const comment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, postId, isDeleted: { $exists: true } },
        data: {
            $unset: { isDeleted: 0, deletedBy: 0 },
            updatedBy: req.user._id
        },
        options: { new: true }
    })

    return successResponse({ res, message: "comment retreived successfully", data: { comment } })
})