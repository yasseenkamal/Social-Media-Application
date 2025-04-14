import { roleTypes } from "../../DB/model/User.model.js";

export const endPoint = {

    User: [roleTypes.user],
    UserAndAdmin: [roleTypes.user, roleTypes.admin]
} 