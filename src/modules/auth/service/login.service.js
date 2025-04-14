import userModel, { providerTypes, roleTypes } from "../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { generateToken, verifyToken, decodedToken, tokenType } from "../../../utils/security/token.security.js";
import { OAuth2Client } from 'google-auth-library';
import * as dbService from '../../../DB/db.service.js'





export const login = asyncHandler(
    async (req, res, next) => {


        const { email, password } = req.body;

        const user = await dbService.findOne({ model: userModel, filter: { email, provider: providerTypes.system } })
        if (!user) {
            return next(new Error('In-valid login data', { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error('please confirm your email first', { cause: 400 }))

        }

        if (!compareHash({ plaintext: password, hashValue: user.password })) {
            return next(new Error('In-valid Account', { cause: 400 }))

        }
        const access_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
        })

        const refresh_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: 31536000
        })

        return successResponse({ res, message: 'Done', data: { token: { access_token, refresh_token } } })
    }

)

export const loginWithGmail = asyncHandler(
    async (req, res, next) => {


        const { idToken } = req.body;

        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.CLIENT_ID,
            });
            const payload = ticket.getPayload();
            return payload
        }
        const payload = await verify()

        if (!payload.email_verified) {
            return next(new Error('In-valid Account', { cause: 400 }))
        }

        let user = await dbService.findOne({ model: userModel, filter: { email: payload.email } })
        if (!user) {
            user = await dbService.create({
                model: userModel,
                data:
                {
                    userName: payload.name,
                    email: payload.email,
                    confirmEmail: payload.email_verified,
                    image: payload.picture,
                    provider: providerTypes.google
                }
            })
        }
        if (user.provider != providerTypes.google) {
            return next(new Error('in-valid provider', { cause: 400 }))

        }

        const access_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
        })

        const refresh_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: 31536000
        })

        return successResponse({
            res, message: 'Done', data: {
                token: { access_token, refresh_token }
                // payload
            }
        })
    }

)

export const refreshToken = asyncHandler(async (req, res, next) => {

    const { authorization } = req.headers;
    const user = await decodedToken({ authorization, tokenType: tokenType.refresh, next })

    const access_token = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    })

    const refresh_token = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: 31536000
    })

    return successResponse({ res, message: 'Done', data: { token: { access_token, refresh_token } } })

})


export const forgotPassword = asyncHandler(async (req, res, next) => {

    const { email } = req.body;
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: false } })
    if (!user) {
        return next(new Error('In-valid account', { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error('please confirm your email first', { cause: 400 }))

    }
    emailEvent.emit("forgotPassword", { id: user._id, email })

    return successResponse({ res })
})

export const validateForgotPassword = asyncHandler(async (req, res, next) => {

    const { email, code } = req.body;
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: false } })
    if (!user) {
        return next(new Error('In-valid account', { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error('please confirm your email first', { cause: 400 }))

    }
    if (!compareHash({ plaintext: code, hashValue: user.resetPasswordOTP })) {
        return next(new Error('in-valid code', { cause: 400 }))

    }

    return successResponse({ res })
})

export const resetPassword = asyncHandler(async (req, res, next) => {

    const { email, code, password } = req.body;
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: false } })
    if (!user) {
        return next(new Error('In-valid account', { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error('please confirm your email first', { cause: 400 }))

    }
    if (!compareHash({ plaintext: code, hashValue: user.resetPasswordOTP })) {
        return next(new Error('in-valid code', { cause: 400 }))

    }
    await dbService.updateOne({
        model: userModel,
        filter: { email },
        data: {
            password: generateHash({ plaintext: password }),
            changeCridentialsTime: Date.now(),
            $unset: {
                resetPasswordOTP: 0
            }
        }
    })

    return successResponse({ res })
})