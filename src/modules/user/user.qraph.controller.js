import { GraphQLString } from 'graphql'
import * as userTypeGraph from './types/user.graph.types.js'
import * as userGraphQueryServices from './service/user.graph.query.service.js'


export const query = {
    getAllUSers: {
        type: userTypeGraph.getAllUsers,
        resolve: userGraphQueryServices.getAllusers
    },
    getProfile: {
        type: userTypeGraph.getProfile,
        args: {
            authorization: { type: GraphQLString }
        },
        resolve: userGraphQueryServices.getProfile
    }
}