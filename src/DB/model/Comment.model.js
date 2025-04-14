import mongoose, { Schema, Types, model } from "mongoose"


const commentSchema = new Schema({
    content: {
        type: String,
        required: function () {
            return this?.attachments?.length ? false : true
        },
        minlength: 2,
        maxlength: 2000,
        trim: true
    },

    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    commentId: { type: Types.ObjectId, ref: "Comment" },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updtedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: Date,
},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    })

commentSchema.virtual("reply", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment"
})


const commentModel = mongoose.models.Commment || model("Comment", commentSchema)
export default commentModel