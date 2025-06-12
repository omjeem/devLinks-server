import { Request, Response } from "express"
import { ErrorTypes, handleError } from "../../config/error"
import { successResponse } from "../../config/response"
import services from "../../services"

export class links {
    static addLinks: any = async (req: Request, res: Response) => {
        try {
            const userId = req["user"]["userId"]
            const body = req.body
            console.log("User id is >>> ", userId, req["user"])
            const linksWith = await services.link.addLinks(body, userId)
            return successResponse(res, 200, "Links saved successfully", linksWith)
        } catch (error) {
            return handleError(res, error)
        }
    }

    static getAllUserLinks: any = async (req: Request, res: Response) => {
        try {
            const userId = req["user"]["userId"]
            const userLinks = await services.link.getAllUserLinks(userId)
            return successResponse(res, 200, "All User links fetched successfully", userLinks)
        } catch (error) {
            return handleError(res, error)
        }
    }

    static getLinkDataWithUserName: any = async (req: Request, res: Response) => {
        try {
            console.log("Params >> ", req.params)
            const userName = req.params.userName
            if (!userName) {
                throw new Error("User name is required")
            }
            const linksWithUsername = await services.link.getLinksthroughUserName(userName)
            console.log("link with username >>> ", linksWithUsername)
            if (!linksWithUsername) {
                throw new Error(ErrorTypes.USER_NOT_FOUND)
            }
            return successResponse(res, 200, "Links you user with username fetched successfully", linksWithUsername)
        } catch (error) {
            return handleError(res, error)
        }
    }

    static updateLinkValue: any = async (req: Request, res: Response) => {
        try {
            const value = req.body[0].value
            const linkId = req.params.linkId
            const userId = req["user"]["userId"]
            const updateLink = await services.link.updateLink(value, linkId, userId)
            return successResponse(res, 200, "Link Updated Successfully", updateLink)
        } catch (error) {
            return handleError(res, error)
        }
    }

    static deleteLink: any = async (req: Request, res: Response) => {
        try {
            const userId = req["user"]["userId"]
            const linkId = req.params.linkId
            const deleteLink = await services.link.deleteLink(linkId, userId)
            return successResponse(res, 200, "Link Deleted Successfully", deleteLink)
        } catch (error) {
            return handleError(res, error)
        }
    }
}