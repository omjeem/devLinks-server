import express from "express"
import controllers from "../../controllers";
import { validateRequest } from "../../middlewares/validateRequest";
import { validators } from "../../validators.ts";

const authRouter = express.Router()

authRouter.post("/login", validateRequest(validators.auth.login), controllers.auth.login)
authRouter.post("/register", controllers.auth.register)
authRouter.get("/google", controllers.auth.googleSignInSignUp)
authRouter.get("/otp", controllers.auth.getOtp)
authRouter.post("/otp", controllers.auth.verifyOtp)

export default authRouter;