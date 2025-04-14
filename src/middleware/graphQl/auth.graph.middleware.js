import { tokenType, verifyToken } from "../../utils/security/token.security.js";
import * as dbService from "../../DB/db.service.js"
import userModel from "../../DB/model/User.model.js";



export const authentication = async ({ 
    authorization = "",
    tokenTypes = tokenType.access,
    accessRoles = [],
    checkAuthorization = false } = {}) => {
        if (!authorization) {
            throw new Error("Missing authorization header");
        }
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        throw new Error("Missing token part")
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
        throw new Error("in-valid token payload")

    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: { $exists: false } } })
    if (!user) {
        throw new Error("not register account")

    }

    if (user.changeCridentialsTime?.getTime() >= decoded.iat * 1000) {
        throw new Error("In-valid login credentials")

    }
    if (checkAuthorization && !accessRoles.includes(user.role)) {
        throw new Error(" Not authorized Account");
    }

    return user
}



