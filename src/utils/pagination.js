import * as dbService from "../DB/db.service.js"


export const paginate = async ({
    page, size, select = "", populate = [], model, filter = {}
} = {}) => {

    page = parseInt(page < 1 ? process.env.PAGE : page)
    size = parseInt(size < 1 ? process.env.SIZE : size)
    const skip = (page - 1) * size

    const count = await postModel.find(filter).countDocuments()
    const data = await dbService.find({
        model: model,
        filter,
        select,
        populate,
        skip,
        limit: size
    });

    return (data, page, size, count)
} 