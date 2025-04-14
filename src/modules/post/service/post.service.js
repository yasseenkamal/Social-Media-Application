import { asyncHandler } from "../../../utils/response/error.response.js";
import { roleTypes, socketConnection } from "../../../DB/model/User.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import * as dbService from '../../../DB/db.service.js'
import { postModel } from "../../../DB/model/Post.model.js";
import { privacyTypes } from "../../../DB/model/Post.model.js";
import { paginate } from "../../../utils/pagination.js";
import { getIo } from "../../socket/socket.controller.js";

export const createPost = asyncHandler(async (req, res, next) => {

    const { content } = req.body;
    let attachments = [];

    if (req.files?.length) {
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/Post` });
            attachments.push({ secure_url, public_id });
        }
        req.body.attachments = attachments;
    }

    const post = await dbService.create({
        model: postModel,
        data: { ...req.body, userId: req.user._id }
    });

    return successResponse({ res, status: 201, data: { post } });
});

export const updatedPost = asyncHandler(async (req, res, next) => {

    if (req.files?.length) {
        const attachments = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "post" });
            attachments.push({ secure_url, public_id });
        }
        req.body.attachments = attachments;
    } else {
        req.body.attachments = [];
    }

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: false },
            userId: req.user._id
        },
        data: {
            ...req.body,
            userId: req.user._id
        },
        options: { new: true }
    });


    return post ? successResponse({ res, data: { post }, status: 200 }) : next(new Error("Invalid post ID", { cause: 404 }));
});

export const freezePost = asyncHandler(async (req, res, next) => {

    const owner = req.user.role === roleTypes.admin ? {} : { userId: req.user._id }
    const filter = { _id: req.params.postId, isDeleted: { $exists: false } };

    if (!owner) filter.userId = req.user._id;
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: false },
            ...owner
        },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id,
            updatedBy: req.user._id
        },
        options: { new: true }
    });

    return post ? successResponse({ res, status: 200, data: { post } }) : next(new Error("Invalid post ID", { cause: 404 }));
});

export const restorePost = asyncHandler(async (req, res, next) => {

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: true },
            deletedBy: req.user._id
        },
        data: {
            $unset: { isDeleted: "", deletedBy: "" }
        },
        options: { new: true }
    });

    return post
        ? successResponse({ res, data: { post }, status: 200 })
        : next(new Error("Invalid post ID", { cause: 404 }));
});

export const likePost = asyncHandler(async (req, res, next) => {

    const data = req.query.action === 'unLike' ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId, isDeleted: { $exists: false }, archive: { $exists: false } },
        data,
        options: { new: true }
    });
    if (!post) {
        return next(new Error("Invalid post Id", { cause: 404 }));
    }
    getIo().to(socketConnection.get(post.createdBy.toString())).emit("likePost", {
        postId: req.params.postId,
        userId: req.user._id,
        action: req.query.action
    }
    )
    return successResponse({ res, data: { post }, status: 200 })
});


export const friendsPosts = asyncHandler(async (req, res, next) => {

    const populateList = [
        { path: "userId", select: 'username image' },
        { path: "likes", select: 'username image' },
        { path: "share", select: 'username image' },
        { path: "tags", select: 'username image' }
    ];

    const posts = await dbService.findAll({
        model: postModel,
        filter: {
            isDeleted: { $exists: false },
            archive: { $exists: false },
            userFriends: req.user._id
        },
        populate: populateList
    });

    return successResponse({ res, data: { posts }, status: 201 });
});

export const publicPost = asyncHandler(async (req, res, next) => {

    const populateList = [
        { path: "userId", select: 'username image' },
        { path: "likes", select: 'username image' },
        { path: "share", select: 'username image' },
        { path: "tags", select: 'username image' }
    ];

    const posts = await dbService.find({
        model: postModel,
        filter: {
            isDeleted: { $exists: false },
            archive: { $exists: false },
            privacy: privacyTypes.public
        },
        populate: populateList
    });

    return successResponse({ res, data: { posts }, status: 200 });
});

export const undoPost = asyncHandler(async (req, res, next) => {

    const post = await dbService.findOne({
        model: postModel,
        filter: { _id: req.params.postId, userId: req.user._id }
    });

    if (!post) return next(new Error("Invalid post ID", { cause: 404 }));
    if (!post.isDeleted || Date.now() - post.isDeleted >= 120000) {
        return next(new Error("Cannot undo, time exceeded", { cause: 400 }));
    }

    const updatedPost = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId, userId: req.user._id },
        data: { $unset: { isDeleted: "", deletedBy: "" } },
        options: { new: true }
    });

    return successResponse({ res, data: { updatedPost }, status: 200 });
});

export const archivePost = asyncHandler(async (req, res, next) => {

    let post = await dbService.findOne({
        model: postModel,
        filter: { _id: req.params.postId, isDeleted: { $exists: false }, userId: req.user._id }
    });

    if (!post) return next(new Error("Invalid post ID", { cause: 404 }));

    if ((Date.now() - new Date(post.createdAt).getTime()) <= 86400000) {
        return next(new Error("Try again after 24 hours", { cause: 400 }));
    }

    post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId, isDeleted: { $exists: false }, userId: req.user._id },
        data: { archive: true },
        options: { new: true }
    });

    return post ? successResponse({ res, data: { post }, status: 200 }) : next(new Error("Invalid post ID", { cause: 404 }));
});


export const getPosts = asyncHandler(async (req, res, next) => {

    let { page, size } = req.query;

    const data = await paginate({
        page, size, model: postModel,
        filter: {
            isDeleted: { $exists: false },

        },
        populate: [{
            path: 'comments',
            match: { isDeleted: { $exists: false }, commentId: { $exists: false } },
            populate: [{
                path: "reply",
                match: { isDeleted: { $exists: false } }
            }]
        }],
    })


    return successResponse({ res, data, status: 200 });
});