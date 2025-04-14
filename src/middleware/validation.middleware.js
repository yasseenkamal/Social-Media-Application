import Joi from "joi"
import { Types } from "mongoose"
import { genderTypes } from "../DB/model/User.model.js"

export const isValidObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("In-valid object Id G")
}


const fileObject = {
    fieldname: Joi.string().valid("attachment"),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    destination: Joi.string(),
    filename: Joi.string(),
    path: Joi.string(),
    size: Joi.number()
}

export const generalFeild = {
    userName: Joi.string().alphanum().case('upper').min(2).max(20).messages({
        'string.min': 'the minimum length of the name is 2',
        'string.empty': 'the name field cannot be empty ',
        'any.required': 'the name field is required',
    }),
    email: Joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'net', 'edu', 'eg'] } }),
    password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#&<>@\"~;$^%{}?])(?=.*[a-zA-z]).{8,}$/)),
    confirmationPassword: Joi.string(),
    phone: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    code: Joi.string().pattern(new RegExp(/^\d{4}$/)),
    Id: Joi.string().custom(isValidObjectId),
    DOB: Joi.date().less("now"),
    gender: Joi.string().valid(...Object.values(genderTypes)),
    address: Joi.string(),
    fileObject,
    file: Joi.object(fileObject)
}


export const validation = (Schema) => {
    return (req, res, next) => {

        const inputData = { ...req.body, ...req.params }

        const validationResult = Schema.validate(inputData, { abortEarly: false })

        if (validationResult.error) {
            return res.status(400).json({ message: 'validation error', validationResult: validationResult.error.details })
        }


        return next()

    }
}