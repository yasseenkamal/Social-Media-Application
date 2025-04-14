import mongoose, { model, Schema, Types } from "mongoose";


export const providerTypes = { google: 'google', system: 'system' }

export const roleTypes = {
    user: 'user',
    admin: 'admin',
    superAdmin: 'superAdmin'
}
export const genderTypes = { male: 'male', female: 'female' }


const userSchema = Schema({

    userName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    confirmEmailOtp: String,
    tempEmail: String,
    tempEmailOtp: String,
    password: {
        type: String,
        required: (data) => {
            return data?.provider === providerTypes.google ? false : true
        }
    },
    resetPasswordOTP: String,
    image: { secure_url: String, public_id: String },
    coverImages: [{ secure_url: String, public_id: String }],
    DOB: Date,
    phone: String,
    address: String,
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.male
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },
    changeCridentialsTime: Date,
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    viewers: [{
        userId: { type: Types.ObjectId, ref: 'User' },
        time: Date
    }],
    friends: [{ type: Types.ObjectId, ref: 'User' }],
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: { type: Date }

}, { timestamps: true })

userSchema.pre("save", function (next, doc) {

    next()
})

export const userModel = mongoose.models.user || model('User', userSchema)
export default userModel
export const socketConnection = new Map()




