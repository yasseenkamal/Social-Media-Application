import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { imageType } from "../../../utils/app.types.shared.js";


export const oneUserType = {
    _id: { type: GraphQLID },
    userName: { type: GraphQLString },
    image: { type: imageType },
    email: { type: GraphQLString },
    address: { type: GraphQLString },
    coverImage: { type: new GraphQLList(imageType) },
    DOB: { type: GraphQLString },
    phone: { type: GraphQLString },
    gender: {
        type: new GraphQLEnumType({
            name: "genderTypes",
            values: {
                male: { type: GraphQLString },
                female: { type: GraphQLString }

            }
        })
    },
    role: {
        type: new GraphQLEnumType({
            name: "roleTypes",
            values: {
                user: { type: GraphQLString },
                admin: { type: GraphQLString },
                superAdmin: { type: GraphQLString },

            }
        })
    },
    provider: {
        type: new GraphQLEnumType({
            name: "providerTypes",
            values: {
                system: { type: GraphQLString },
                google: { type: GraphQLString }

            }
        })
    },
    // updatedBy:{type:oneUserResponse}
}
export const oneUserResponse = new GraphQLObjectType({
    name: "oneUserRes",
    fields: {
        ...oneUserType,
        viewers: {
            type: new GraphQLList(
                new GraphQLObjectType({
                    name: "viwersList",
                    fields: {
                        ...oneUserType
                    }
                })
            )
        },
        updatedBy: { type: GraphQLID }
    }



})





export const getAllUsers = new GraphQLObjectType({
    name: "getAllUsers",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLInt },

        data: {
            type: new GraphQLList(
                new GraphQLObjectType({
                    name: "oneUserResponse",
                    fields: {
                        ...oneUserType,

                        viewers: {
                            type: new GraphQLList(
                                new GraphQLObjectType({
                                    name: "viewers",
                                    fields: {
                                        ...oneUserType,
                                        time: { type: new GraphQLList(GraphQLString) }
                                    }
                                })


                            )
                        },
                    }
                })
            )
        },

        updatedBy: { type: GraphQLID },

    }

})


export const getProfile = new GraphQLObjectType({
    name: "GetProfileRes",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLInt },
        data: {
            type: new GraphQLObjectType({
                name: "userProfileResponse",
                fields: {
                    ...oneUserType
                }
            })
        }
    }


})