import { and, eq } from "drizzle-orm"
import { generateRandomUUID } from "../../config/constants"
import postgreDb from "../../config/db"
import { links, users } from "../../models/schema"

export class link {

    static addLinks = async (linksData: { field: string, value: string }[], userId: String) => {
        const linksWithId = linksData.map((link) => {
            return {
                userId,
                ...link,
                id: generateRandomUUID()
            }
        })
        return await postgreDb
            .insert(links)
            .values(linksWithId)
            .returning({
                id: links.id,
                field: links.field,
                value: links.value,
                createdAt: links.createdAt
            })
    }


    static getLinksthroughUserName = async (userName: string) => {
        return await postgreDb.query.users.findFirst({
            where: eq(users.userName, userName),
            columns: {
                userName: true,
                name: true
            },
            with: {
                links: {
                    columns: {
                        id: true,
                        field: true,
                        value: true,
                        createdAt: true
                    }
                }
            }
        })
    }

    static updateLink = async (value: string, linkId: string, userId: string) => {
        return await postgreDb
            .update(links)
            .set({ value })
            .where(
                and(
                    eq(links.id, linkId),
                    eq(links.userId, userId)
                )
            )
            .returning({
                id: links.id,
                field: links.field,
                value: links.value
            })
    }

    static deleteLink = async (linkId: string, userId: string) => {
        return await postgreDb
            .delete(links)
            .where(
                and(
                    eq(links.id, linkId),
                    eq(links.userId, userId)
                )
            )
            .returning({
                id: links.id,
                field: links.field,
                value: links.value
            })
    }

    static getAllUserLinks: any = async (userId: string) => {
        return await postgreDb.query.links.findMany({
            where: eq(links.userId, userId),
            columns: {
                id: true,
                field: true,
                value: true,
                createdAt: true
            }
        })
    }
}