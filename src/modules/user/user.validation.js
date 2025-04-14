import Joi from "joi";
import { generalFeild } from "../../middleware/validation.middleware.js";


export const shareProfile = Joi.object().keys({


    profileId: generalFeild.Id.required()


}).required()

export const profileImage = Joi.object().keys({


    file: Joi.object().required()


}).required()

export const updateEmail = Joi.object().keys({
    email: generalFeild.email.required()
}).required()


export const resetEmail = Joi.object().keys({

    // email: generalFeild.email.required(),
    oldCode: generalFeild.code.required(),
    newCode: generalFeild.code.required()

}).required()


export const updatePassword = Joi.object().keys({

    oldPassword: generalFeild.password.required(),
    password: generalFeild.password.not(Joi.ref('oldPassword')).required(),
    confirmationPassword: generalFeild.confirmationPassword.valid(Joi.ref('password')).required(),
}).required()


export const updateProfile = Joi.object().keys({

    userName: generalFeild.userName,
    DOB: generalFeild.DOB,
    gender: generalFeild.gender,
    phone: generalFeild.phone,
    address: generalFeild.address
}).required()

export const userProfileGraph = Joi.object().keys({
    authorization: Joi.string().required()

}).required()