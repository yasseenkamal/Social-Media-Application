import * as postQueryServices from './service/post.graph.query.service.js'
import * as postGraphTypes from './types/post.types.js'
import * as postMutationServices from './service/post.mutation.service.js'
import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import * as postTypes from './types/post.types.js'


export const query = {
    postList: {
        type: postTypes.postList,
        resolve: postQueryServices.postList
    }
}


export const mutation = {
    likePost: {
        type: postGraphTypes.likePost,
        args: {
            postId: { type: new GraphQLNonNull(GraphQLID) },
            authorization: { type: new GraphQLNonNull(GraphQLString) },
            action: {
                type: new GraphQLEnumType({
                    name: "actionTypes",
                    values: {
                        like: { type: GraphQLString },
                        unLike: { type: GraphQLString },
                    }
                })
            }
        },
        resolve: postMutationServices.likePost
    }
}