import { postModel } from '../../../DB/model/Post.model.js'
import * as dbServices from '../../../DB/db.service.js'


export const postList = async (parent, args) => {
    const posts = await dbServices.find({
        model: postModel,
        // populate: [{ path: "createdBy" }] 
    });
    return { message: "done", statusCode: 200, data: posts };
};


