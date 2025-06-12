import express from "express"
import { validateRequest } from "../../middlewares/validateRequest"
import { validators } from "../../validators.ts"

const linkRouter = express.Router()

linkRouter.post("/link", validateRequest(validators.links.addLinks))

export default linkRouter