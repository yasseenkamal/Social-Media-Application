import { GraphQLSchema, GraphQLObjectType, GraphQLString } from "graphql"
import * as postGraphController from './post/post.graph.controller.js'
import * as userGraphController from './user/user.qraph.controller.js'

export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "SoicailApp",
        description: "main app query",
        fields: {
            ...postGraphController.query,
            ...userGraphController.query

        }
    }),
    mutation:new GraphQLObjectType({
        name:"SocialAppMutation",
        fields:{
            ...postGraphController.mutation
        }
    })
})   