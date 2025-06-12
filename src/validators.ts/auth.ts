import z from "zod"

export class auth {

    static login = z.object({
        body: z.object({
            email: z.string(),
            password: z.string()
        })
    })

}