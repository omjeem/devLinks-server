import express from "express"
import { authMiddleware, validateRequest } from "../../middlewares/validateRequest"
import { validators } from "../../validators.ts"
import controllers from "../../controllers"

const linkRouter = express.Router()

linkRouter.post(
    "/",
    authMiddleware,
    validateRequest(validators.links.addLinks),
    controllers.links.addLinks
)

linkRouter.get(
    "/:userName",
    controllers.links.getLinkDataWithUserName
)

linkRouter.get(
    "/",
    authMiddleware,
    controllers.links.getAllUserLinks
)

linkRouter.put(
    "/:linkId",
    authMiddleware,
    validateRequest(validators.links.addLinks),
    controllers.links.updateLinkValue
)

linkRouter.delete(
    "/:linkId",
    authMiddleware,
    controllers.links.deleteLink
)

export default linkRouter