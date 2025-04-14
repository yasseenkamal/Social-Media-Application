import { tokenType, verifyToken } from "../../utils/security/token.security.js";
import * as dbService from "../../DB/db.service.js"
import userModel from "../../DB/model/User.model.js";



export const authentication = async ({
    socket = {},
    tokenTypes = tokenType.access,
    accessRoles = [],
    checkAuthorization = false } = {}) => {

    const [bearer, token] = socket?.handshake?.auth?.authorization?.split(" ") || []
    if (!bearer || !token) {
        return { data: { message: "Missing token part", status: 400 } }
    }

    let access_signature = '';
    let refresh_signature = '';
    switch (bearer) {
        case "system":
            access_signature = process.env.ADMIN_ACCESS_TOKEN;
            refresh_signature = process.env.ADMIN_REFRESH_TOKEN;
            break;
        case "Bearer":
            access_signature = process.env.USER_ACCESS_TOKEN;
            refresh_signature = process.env.USER_REFRESH_TOKEN;
            break;
    }
    const decoded = verifyToken({ token, signature: tokenTypes === tokenType.access ? access_signature : refresh_signature })
    if (!decoded?.id) {
        return { data: { message: "in-valid token payload", status: 401 } }

    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: { $exists: false } } })
    if (!user) {
        return { data: { message: "not register account", status: 404 } }

    }

    if (user.changeCridentialsTime?.getTime() >= decoded.iat * 1000) {
        return { data: { message: "In-valid login credintials", status: 400 } }

    }
    if (checkAuthorization && !accessRoles.includes(user.role)) {
        return { data: { message: " Not authorized Account", status: 403 } };
    }

    return { data: { message: "Done", user }, valid: true }
}



