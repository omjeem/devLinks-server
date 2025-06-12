import { Request, Response } from "express"
import { handleError } from "../../config/error"
import { successResponse } from "../../config/response"

export class links {
    static addLinks: any = async (req: Request, res: Response) => {
        try {
            const body = req.body
            console.log("User bodt is ", req["user"])
            return successResponse(res, 200, "Links saved successfully", body)
        } catch (error) {
            return handleError(res, error)
        }
    }
}