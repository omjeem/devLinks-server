import express from "express"
import { authMiddleware, validateRequest } from "../../middlewares/validateRequest"
import { validators } from "../../validators.ts"
import controllers from "../../controllers"

const linkRouter = express.Router()

linkRouter.post("/", authMiddleware, validateRequest(validators.links.addLinks), controllers.links.addLinks)

export default linkRouter