import Joi from "joi";
import { generalFeild } from "../../middleware/validation.middleware.js";


export const signup = Joi.object().keys({

    userName: generalFeild.userName.required(),
    email: generalFeild.email.required(),
    password: generalFeild.password.required(),
    confirmationPassword: generalFeild.confirmationPassword.valid(Joi.ref("password")).required(),
    phone: generalFeild.phone

}).required().options({ allowUnknown: false })


export const confirmEmail = Joi.object().keys({

    email: generalFeild.email.required(),
    code: generalFeild.code.required()

}).required().options({ allowUnknown: false })

export const validateForgotPassword = confirmEmail

export const login = Joi.object().keys({

    email: generalFeild.email.required(),
    password: generalFeild.password.required(),

}).required().options({ allowUnknown: false })


export const forgotPassword = Joi.object().keys({

    email: generalFeild.email.required()

}).required().options({ allowUnknown: false })


export const resetPassword = Joi.object().keys({

    email: generalFeild.email.required(),
    code: generalFeild.code.required(),
    password: generalFeild.password.required(),
    confirmationPassword: generalFeild.confirmationPassword.valid(Joi.ref("password")).required()

}).required().options({ allowUnknown: false })