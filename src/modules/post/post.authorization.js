import { roleTypes } from "../../DB/model/User.model.js"


export const endpoints = {

    createPost: [roleTypes.user],
    freezePost: [roleTypes.admin, roleTypes.user],
    likePost: [roleTypes.admin, roleTypes.user],


}