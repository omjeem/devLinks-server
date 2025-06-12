import { Request, Response } from "express"
import { handleError } from "../../config/error"

export class links {
    static addLinks: any = async (req: Request, res: Response) => {
        try {
            const body = req.body
        } catch (error) {
            return handleError(res, error)
        }
    }
}