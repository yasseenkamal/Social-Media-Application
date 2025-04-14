import { Server } from "socket.io";
import { logoutSocketId, registerSocket } from "./service/auth.socket.service.js";
import { sendMessage } from "./service/message.service.js";

let io = undefined


export const runIo = (httpServer) => {

     io = new Server(httpServer, { cors: "*" })



    return io.on("connection", async (socket) => {
        console.log(socket.id);
        console.log(socket.handshake.auth.authorization);

        await registerSocket(socket)
        await logoutSocketId(socket)
        await sendMessage(socket)

    })

}

export const getIo = ()=>{

    
    return io
}