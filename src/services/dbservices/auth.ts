import { eq } from "drizzle-orm"
import postgreDb from "../../config/db"
import { UsersModal, users } from "../../models/schema"
import { ErrorTypes, throwError } from "../../config/error"
import { bcryptPassword, validatePassword } from "../../config/passwordHash"
import { generateAuthTokens } from "../../config/token"
import { envConfig } from "../../config/envConfigs"
import nodemailer from "nodemailer"
import { SIgnINMethod, emailTemplateForOTP, generateOtpToken, generateRandomOTP, generateRandomUUID } from "../../config/constants"

export class auth {

    static setUserVerified = async (userId: string) => {
        return await postgreDb.update(users).set({ isVerified: true }).where(eq(users.id, userId))
    }

    static getUserByEmail = async (email: string) => {
        const user = await postgreDb.query.users.findFirst({
            where: eq(users.email, email),
        })
        if (!user) {
            throwError(ErrorTypes.EMAIL_NOT_FOUND)
        }
        return user;
    }

    static loginWithPassword = async (email: string, password: string) => {
        const user = await this.getUserByEmail(email)
        if (!user.password) {
            throwError(ErrorTypes.PASSWORD_NOT_FOUND)
        }
        const isValid = await validatePassword(password, user.password)
        if (!isValid) {
            throw new Error("Invalid password")
        }
        return this.userDetails(user)
    }

    static insertUser = async (details: any, tx: any, signMethod: string) => {
        try {
            return await tx
                .insert(users)
                .values({
                    id: generateRandomUUID(),
                    name: details.name,
                    email: details.email,
                    signMethod,
                    userName: details.userName,
                    password: signMethod === SIgnINMethod.PASSWORD ? await bcryptPassword(details.password) : null,
                    isVerified: signMethod === SIgnINMethod.PASSWORD ? false : true
                })
                .onConflictDoNothing({ target: users.email })
                .returning({
                    id: users.id,
                    name: users.name,
                    userName: users.userName,
                    email: users.email,
                });
        } catch (error) {
            throw new Error("User name already exists! Please try another one")
        }
    };

    static userDetails = (users: UsersModal) => {
        const token = generateAuthTokens({ userId: users.id, userName: users.userName });
        return {
            userId: users.id,
            email: users.email,
            userName: users.userName,
            name: users.name,
            token
        };
    };

    static verifyUser = async (userId: string) => {
        return await postgreDb.update(users).set({ isVerified: true }).where(eq(users.id, userId))
    }


    static register = async (details: any, fromMethod: string): Promise<any> => {

        return await postgreDb.transaction(async (tx) => {

            const registerUser = await this.insertUser(details, tx, fromMethod);
            if (registerUser.length <= 0) throwError(ErrorTypes.USER_ALREADY_EXISTS);
            console.log("Sign method password ", fromMethod)
            if (fromMethod === SIgnINMethod.PASSWORD) {
                const token = await this.generateAuthOtpToken(details.email)
                console.log("Gen token ios ", token)
                return token
            }
            return this.userDetails(registerUser[0]);
        });

    };

    static loginThroughMethod = async (email: any): Promise<any> => {
        try {
            const findUser = await postgreDb.query.users.findFirst({
                where: eq(users.email, email),
            })
            return findUser ? this.userDetails(findUser) : null
        } catch (error) {
            throw new Error(error.message);
        }
    };

    static generateAuthOtpToken: any = async (email: string) => {
        const otp = generateRandomOTP();
        const token = generateOtpToken(email, otp)
        const emailTemp = emailTemplateForOTP(otp)
        await this.sendEmail(
            [email],
            emailTemp,
            "Devlinks Verification Code – Your OTP is Valid for 10 Minutes"
        )
        return token
    }

    static sendEmail = async (receiverEmails: any[], emailTemplate: string, subject: string): Promise<any> => {
        try {
            let htmlContent = emailTemplate;

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: envConfig.nodeMailer.mail,
                    pass: envConfig.nodeMailer.pass,
                },
            });

            const mailOptions = {
                from: envConfig.nodeMailer.mail,
                to: receiverEmails,
                subject: subject,
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully", info)
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}