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

    static login = async (email: string, password: string) => {
        const user = await this.getUserByEmail(email)
        if (!user.password) {
            throwError(ErrorTypes.PASSWORD_NOT_FOUND)
        }
        await validatePassword(password, user.password)
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
                    userName: users.userName,
                    email: users.email,
                    signMethod: users.signMethod,
                    isVerified: users.isVerified
                });
        } catch (error) {
            throw new Error(error);
        }
    };

    static userDetails = (users: UsersModal) => {
        if (!users.isVerified) return null
        const Token = generateAuthTokens({ userId: users.id });
        return {
            userId: users.id,
            email: users.email,
            userName: users.userName,
            signMethod: users.signMethod,
            token: Token,
        };
    };

    static verifyUser = async (userId: string) => {
        return await postgreDb.update(users).set({ isVerified: true }).where(eq(users.id, userId))
    }


    static register = async (details: any, fromMethod: string): Promise<any> => {

        return await postgreDb.transaction(async (tx) => {

            const registerUser = await this.insertUser(details, tx, fromMethod);
            if (registerUser.length <= 0) throwError(ErrorTypes.USER_ALREADY_EXISTS);
            if (fromMethod === SIgnINMethod.PASSWORD) {
                const email = details.email
            }
            return this.userDetails(registerUser[0]);
        });

    };

    static loginThroughMethod = async (email: any): Promise<any> => {
        try {
            const findUser = await postgreDb.query.users.findFirst({
                where: eq(users.email, email),
            })

            if (findUser)
                return this.userDetails(findUser);

            else
                return null;

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