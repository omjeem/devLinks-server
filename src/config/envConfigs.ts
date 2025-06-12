import { configDotenv } from "dotenv";
import { z } from "zod";

configDotenv()


export const envVarsSchema = z.object({
    DATABASE_URL: z.string(),
    PORT: z.string().transform((str) => parseInt(str, 10)),
    JWT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URL: z.string(),
    JWT_EXPIRES: z.string().transform((str) => parseInt(str, 10)),
    BACKEND_URL: z.string(),
    FRONTEND_URL: z.string(),
    NODE_MAILER_MAIL: z.string(),
    NODE_MAILER_PASS: z.string()
})

const envVars = envVarsSchema.parse(process.env)

export const envConfig = {
    databaseUrl: envVars.DATABASE_URL,
    port: envVars.PORT,
    jwt: {
        secret: envVars.JWT_SECRET,
        expires: envVars.JWT_EXPIRES
    },
    backendUrl: envVars.BACKEND_URL,
    fontendUrl: envVars.FRONTEND_URL,
    google: {
        clientId: envVars.GOOGLE_CLIENT_ID,
        secret: envVars.GOOGLE_CLIENT_SECRET,
        redirectUrl: envVars.GOOGLE_REDIRECT_URL
    },
    nodeMailer: {
        mail : envVars.NODE_MAILER_MAIL,
        pass : envVars.NODE_MAILER_PASS
    }
}

console.log(envConfig)

