import { EventEmitter } from "node:events";
import { customAlphabet } from "nanoid";
import userModel from "../../DB/model/User.model.js";
import { verifyAccountTemp } from "../email/template/verifyAccount.template.js";
import { sendEmail } from "../email/send.email.js";
import { generateHash } from "../security/hash.security.js";
import * as dbService from '../../DB/db.service.js'
export const emailEvent = new EventEmitter()

export const emailSubject = {
    confirmEmail: "Confirm-Email ",
    resetPassword: "Reset-Password",
    updateEmail: "Update-Email",
}

export const sendCode = async ({ data = {}, subject = emailSubject.confirmEmail } = {}) => {

    const { id, email } = data;
    const otp = customAlphabet("0123456789", 4)();
    const hashOTP = generateHash({ plaintext: otp });
    console.log(`Generated OTP: ${otp}`);
    let updateData = {}
    switch (subject) {
        case emailSubject.confirmEmail:
            updateData = { confirmEmailOtp: hashOTP }
            break;
        case emailSubject.resetPassword:
            updateData = { resetPasswordOTP: hashOTP }
            break;
        case emailSubject.updateEmail:
            updateData = { tempEmailOtp: hashOTP }
            break;
        default:
            break;
    }

    await dbService.updateOne({ model: userModel, filter: { _id: id }, data: updateData })

    const html = verifyAccountTemp({ code: otp })
    await sendEmail({ to: email, subject, html })

}

emailEvent.on('sendConfirmEmail', async (data) => {
    await sendCode({ data })
})

emailEvent.on("updateEmail", async (data) => {
    await sendCode({ data, subject: emailSubject.updateEmail })
})

emailEvent.on("forgotPassword", async (data) => {
    await sendCode({ data, subject: emailSubject.resetPassword })
})
