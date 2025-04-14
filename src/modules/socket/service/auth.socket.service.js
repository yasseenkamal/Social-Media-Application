import { socketConnection } from "../../../DB/model/User.model.js";
import { authentication } from "../../../middleware/socket/auth.socket.middleware.js";



export const registerSocket = async (socket) => {

    const { data, valid } = await authentication({ socket })
    console.log({ data, valid });
    if (!valid) {
        return socket.emit("socket_Error", data)
    }
    socketConnection.set(data?.user._id.toString(), socket.id)
    console.log(socketConnection);

    return "Done"
}

export const logoutSocketId = async (socket) => {
    socket.on('disconnect', async () => {
        const { data, valid } = await authentication({ socket })
        console.log({ data, valid });
        if (!valid) {
            return socket.emit("socket_Error", data)
        }
        socketConnection.delete(data?.user._id.toString())
        console.log(socketConnection);

        return "Done"
    })
}