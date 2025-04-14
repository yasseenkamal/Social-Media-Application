import { postModel } from "../../../DB/model/Post.model.js";
import { likePostGraph } from "../post.validation.js";
import * as dbService from "../../../DB/db.service.js"
import { authentication } from "../../../middleware/graphQl/auth.graph.middleware.js";
import { validation } from "../../../middleware/graphQl/validation.graph.middleware.js";

export const likePost = async (parent, args) => {

    const { postId, authorization, action } = args
    const user = await authentication({ authorization })
    await validation(likePostGraph, args)

    const data = action === "unLike" ? { $pull: { likes: user._id } } : { $addToSet: { likes: user._id } }

    const posts = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: postId, isDeleted: { $exists: false } },
        data
    })


    return ({ message: "Done", status: 200, data: posts })

}