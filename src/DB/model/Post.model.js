import mongoose, { Types, Schema, model } from "mongoose";
import * as dbService from '../db.service.js';
import commentModel from "./Comment.model.js";
export const privacyTypes = {
    public: "public",
    userFriends: "friends",
    specific: "specific"
}


export const roleTypes = {
    User: 'user',
    Admin: 'admin'
}

const postSchema = new Schema({
    content: {
        type: String,
        minlength: 2,
        maxlength: 3000,
        trim: true,
        required: function () {
            return this?.attachments?.length ? false : true

        },
    },
    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    share: [{ type: Types.ObjectId, ref: "User" }],
    userId: { type: Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updtedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: Date,
    archive: Boolean,
    privacy: {
        type: String,
        enum: Object.values(privacyTypes),
        default: privacyTypes.public
    },
    userFriends: [String],
    specific: [String]
},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    })

postSchema.virtual('comments', {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment"
})

postSchema.pre("findOneAndUpdate", function (next) {

    const update = this.getUpdate();
    if (!update.createdBy && update.userId) {
        update.createdBy = update.userId;
    }
    next();
});

postSchema.pre("save", function (next) {
    if (!this.createdBy && this.userId) {
        this.createdBy = this.userId;
    }
    next();
});

postSchema.post("findOneAndUpdate", async function (doc, next) {

    const x = this.getUpdate()
    const y = this.getFilter()

    if (x.$set.isDeleted) {

        await dbService.updateMany({
            model: commentModel,
            filter: {
                postId: y._id
            },
            data: {
                isDeleted: Date.now(),
                deletedBy: y.userId
            }
        })
    }
    if (x.$unset?.isDeleted == "") {
        await dbService.updateMany({
            model: commentModel,
            filter: {
                postId: y._id
            },
            data: {
                $unset: {
                    isDeleted: "",
                    deletedBy: ""
                }
            }
        })
    }

})

export const postModel = mongoose.models.Post || model("Post", postSchema)
