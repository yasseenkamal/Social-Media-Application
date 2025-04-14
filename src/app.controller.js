import connectDB from './DB/connection.js'
import authController from './modules/auth/auth.controller.js'
import { globalErrorHaneling } from './utils/response/error.response.js'
import userController from "./modules/user/user.controller.js"
import postController from './modules/post/post.controller.js'
import chatController from './modules/chate/chat.controller.js'
import path from "node:path"
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createHandler } from 'graphql-http/lib/use/express'
import playground from "graphql-playground-middleware-express"
import { schema } from './modules/app.graph.js'
import cors from 'cors'
const limiter = rateLimit({
    limit: 5,
    windowMs: 2 * 60 * 100
})

const postLimiter = rateLimit({
    limit: 2,
    windowMs: 2 * 60 * 100,
})

const bootstrap = (app, express) => {

    // let whitelist = ['http://example1.com', 'http://example2.com']
    // var corsOptions = {
    //   origin: function (origin, callback) {
    //     if (whitelist.indexOf(origin) !== -1) {
    //       callback(null, true)
    //     } else {
    //       callback(new Error('Not allowed by CORS'))
    //     }
    //   }
    // }
    // app.use(cors(corsOptions))
    app.use(cors());
    app.use(helmet())
    app.use("/auth", limiter)
    app.use("/post", postLimiter)
    app.use(cors({
        origin: "*"
    }));

    app.get("/playground", playground.default({ endpoint: '/graphql' }))


    app.use("/graphql", createHandler({ schema: schema }))
    app.use(express.json())
    app.use('/uploads', express.static(path.resolve('./src/uploads')))
    app.get("/", (req, res, next) => {
        return res.status(200).json({ message: "Welcome in node.js project powered by express and ES6" })
    })
    app.use("/auth", authController)
    app.use("/user", userController)
    app.use("/post", postController)
    app.use("/chat", chatController)

    app.all("*", (req, res, next) => {
        return res.status(404).json({ message: "In-valid routing" })
    })

    //Error handling
    app.use(globalErrorHaneling)


    connectDB()

}

export default bootstrap 