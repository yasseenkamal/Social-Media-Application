import path from 'node:path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join('./src/config/.env.dev') })
import bootstrap from './src/app.controller.js'
import express from 'express'
import chalk from 'chalk'
import { runIo } from './src/modules/socket/socket.controller.js'

const app = express()
const port = process.env.PORT || 8000



bootstrap(app, express)

const httpServer = app.listen(port, () => console.log(chalk.bgGreen(`Example app listening on port ${port}!`)))
runIo(httpServer)

 