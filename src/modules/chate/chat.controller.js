import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import * as chatService from "./service/chat.service.js"
const router = Router()

router.get("/:friendId", authentication(), chatService.getChat)

export default router