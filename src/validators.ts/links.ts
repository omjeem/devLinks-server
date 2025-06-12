import { z } from "zod";

const platformRegexMap: Record<string, RegExp> = {
    Github: /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/,
    Linkedin: /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/,
    Facebook: /^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+\/?$/,
};

export class links {
    static addLinks = z.object({
        body: z.array(
            z.object({
                field: z.string(),
                value: z.string().url(),
            }).superRefine((data, ctx) => {
                const pattern = platformRegexMap[data.field];
                if (pattern && !pattern.test(data.value)) {
                    ctx.addIssue({
                        path: ['url'],
                        code: z.ZodIssueCode.custom,
                        message: `Invalid ${data.value} URL format.`,
                    });
                }
            })
        )
    })
}
