import { authentication } from "../../../middleware/graphQl/auth.graph.middleware.js"
import { validation } from "../../../middleware/validation.middleware.js"
import { userProfileGraph } from "../user.validation.js"
import userModel from "../../../DB/model/User.model.js"
import * as dbService from "../../../DB/db.service.js"



export const getProfile = async (parent, args) => {
    const { authorization } = args
    await validation(userProfileGraph, args)
    const user = await authentication({ authorization })
    console.log(user);

    await dbService.findOne({
        model: userModel,
        filter: { _id: user._id, isDeleted: { $exists: false } }
    })

    return ({ message: "Done", status: 200, data: user })
}


export const getAllusers = async (parent, args) => {
    const users = await dbService.find({ model: userModel })
    return { message: "Done", status: 200, data: users }

}
