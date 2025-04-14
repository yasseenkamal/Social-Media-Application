import mongoose, { Schema, model, Types } from "mongoose";

const friendRequestSchema = new Schema({

    friendId: { type: Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    status: { type: Boolean, default: false }



}, { timestamps: true })

export const friendRequetModel = mongoose.models.FriendRequest || model("FriendRequest", friendRequestSchema)