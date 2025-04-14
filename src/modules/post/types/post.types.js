import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { oneUserResponse } from "../../user/types/user.graph.types.js"
import { imageType } from "../../../utils/app.types.shared.js"
import * as dbService from '../../../DB/db.service.js'
import userModel from "../../../DB/model/User.model.js"


export const onePost = new GraphQLObjectType({
    name: "onePostRes",
    fields: {
        _id: { type: GraphQLID },
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(imageType) },
        likes: { type: new GraphQLList(GraphQLID) },
        tags: { type: new GraphQLList(GraphQLID) },
        share: { type: new GraphQLList(GraphQLID) },
        userId: { type: GraphQLID },
        createdBy: {
            type: GraphQLID

        },
        createdByPopulate: {
            type: oneUserResponse,
            resolve: async (parent, args) => {
                const user = await dbService.findOne({
                    model: userModel,
                    filter: { _id: parent.createdBy }
                })
                return user
            }
        },
        updtedBy: { type: GraphQLID },
        deletedBy: { type: GraphQLID },
        isDeleted: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        createdAt: { type: GraphQLString }
    }
})


export const postList = new GraphQLObjectType({
    name: "postListRes",
    fields: {
        message: { type: GraphQLString },
        statusCode: { type: GraphQLInt },
        data: {
            type: new GraphQLList(onePost)
        }
    }

})

export const likePost =
    new GraphQLObjectType({
        name: "likePostRes",
        description: " like post",
        fields: {
            message: { type: GraphQLString },
            status: { type: GraphQLInt },
            data: {
                type: onePost
            }
        }

    })

export const getAllPosts =
    new GraphQLObjectType({
        name: "postResponse",
        description: " respone on one post",
        fields: {
            message: { type: GraphQLString },
            status: { type: GraphQLInt },
            data: { type: new GraphQLList(onePost) }
        }

    })







