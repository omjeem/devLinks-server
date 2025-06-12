import express, { Request, Response } from "express";
import { successResponse } from "../config/response";
import authRouter from "./routes/auth";
import linkRouter from "./routes/links";

const router = express.Router()


const routes = [
    {
        path: "/auth",
        route: authRouter
    },
    {
        path: "/link",
        route: linkRouter
    }
]

routes.forEach((route) => {
    router.use(route.path, route.route)
})

router.get("/", (req: Request, res: Response): any => {
    return successResponse(res, 200, "Welcome to Dev Links Api")
})


export default router;