import { asyncHandler } from "../../../utils/response/error.response.js";
import userModel from "../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import * as dbService from '../../../DB/db.service.js'


export const signup = asyncHandler(async (req, res, next) => {
    const { userName, email, password } = req.body;

    if (await dbService.findOne({ model: userModel, filter: { email } })) {
        return next(new Error('Email exist', { cause: 409 }))
    }

    const hashPassword = generateHash({ plaintext: password })
    const user = await dbService.create({
        model: userModel,
        data: { userName, email, password: generateHash({ plaintext: password }) }
    })

    emailEvent.emit("sendConfirmEmail", { id: user._id, email })

    return successResponse({ res, message: "Done", data: { user }, status: 201 })
})

export const confirmWithOTP = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;

    console.log("Received Email:", email);
    console.log("Input Code:", code);

    const user = await dbService.findOne({ model: userModel, filter: { email } });
    if (!user) {
        return next(new Error('Invalid account', { cause: 404 }));
    }
    if (user.confirmEmail) {
        return next(new Error('Already verified', { cause: 409 }));
    }

    console.log("Stored OTP Hash:", user.confirmEmailOtp);

    const isValidCode = compareHash({ plaintext: code, hashValue: user.confirmEmailOtp });
    console.log("Is Valid Code:", isValidCode);

    if (!isValidCode) {
        return next(new Error('Invalid code', { cause: 400 }));
    }

    const userResult = await dbService.findOneAndUpdate(
        {
            model: userModel,
            filter: { email },
            data:
                { confirmEmail: true, $unset: { confirmEmailOtp: 0 } },
            // { new: true }
        }
    );

    return successResponse({ res, message: 'Done', data: { userResult } });
});

