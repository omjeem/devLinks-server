import { Request, Response } from "express";
import { successResponse } from "../../config/response";
import { ErrorTypes, handleError, throwError } from "../../config/error";
import services from "../../services";
import { envConfig } from "../../config/envConfigs";
import axios from "axios";
import { verifyTokenAndGetPayload } from "../../config/token";
import url from "node:url";
import nodemailer from "nodemailer"
import { AUTH_TOKEN, SIgnINMethod, emailTemplateForOTP, generateOtpToken, generateRandomOTP, isValidEmail, verifyOtpHash, verifyOtpToken } from "../../config/constants";
import controllers from "..";

export class auth {


    static login: any = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            console.log("Request body is ", req.body)
            const user = await services.auth.loginWithPassword(email, password);
            if (!user) throwError(ErrorTypes.USER_NOT_VERIFIED)
            return successResponse(res, 200, "User logged in successfully!", user)
        } catch (error) {
            return handleError(res, error)
        }
    }

    static register: any = async (req: Request, res: Response) => {
        try {
            const { email, password, userName, name } = req.body;
            if (!userName || /\s/.test(userName)) {
                throw new Error('Username must not contain whitespace.')
            }
            if (!email || !name || !userName || !password) {
                throw new Error("All fields Email, name, username, password is required")
            }
            const user = await services.auth.register(
                { email, password, userName, name },
                SIgnINMethod.PASSWORD
            );
            return successResponse(res, 200, "User registered Successfully!", user)
        } catch (error) {
            return handleError(res, error)
        }
    }


    static verifyOtp: any = async (req: Request, res: Response) => {
        try {
            const otp = req.body.otp
            const token = req.body.token
            if (!token || !otp) {
                throw new Error("Otp And Token is required")
            }
            const decodeToken = verifyOtpToken(token)
            const hash = decodeToken.otp
            const email = decodeToken.email
            const verify = verifyOtpHash(hash, email, otp)
            if (!verify) {
                throw new Error("OOps! You send the wrong otp")
            }
            const userData = await services.auth.getUserByEmail(email)
            if (!userData) {
                throw new Error("User not exists")
            }
            if (!userData.isVerified) {
                await services.auth.setUserVerified(userData.id)
                userData.isVerified = true
            }
            const userDataResponse = services.auth.userDetails(userData)
            return successResponse(res, 200, "Otp Verified Successfully", userDataResponse)
        } catch (error) {
            return handleError(res, error)
        }
    }



    static getOtp: any = async (req: Request, res: Response) => {
        try {
            const email: string = String(req.body.email)
            if (!email || !isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "Email is required and should valid" });
            }
            const user = await services.auth.getUserByEmail(email)
            if (!user) {
                return res.status(400).send({ status: false, message: `User with the email ${email} not exists please signup first` });
            }
            const token = await services.auth.generateAuthOtpToken(email)
            return res.status(200).send({
                status: true,
                message: `Otp Sent Successfully on you Email`,
                data: token
            })
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message });
        }
    }

    static generateUserName(name: string): string {
        const sanitized = name.replace(/\s+/g, ''); // Remove all whitespace
        const randomSuffix = Math.random().toFixed(4).slice(2); // 4-digit random number
        return `${sanitized}-${randomSuffix}`;
    }


    static googleSignInSignUp: any = async (req: Request, res: Response) => {
        try {
            const token = req.query.code;
            let clientId = envConfig.google.clientId;
            let clientSecret = envConfig.google.secret;
            let REDIRECT_URI = envConfig.google.redirectUrl;
            const validateUser = await axios.post(
                `https://oauth2.googleapis.com/token`,
                {
                    code: token,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: REDIRECT_URI,
                    grant_type: "authorization_code",
                }
            );
            const { id_token, access_token } = validateUser.data;
            const { email, name, picture } = await axios
                .get(
                    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
                    {
                        headers: {
                            Authorization: `Bearer ${id_token}`,
                        },
                    }
                )
                .then((res) => res.data)
                .catch((error) => {
                    console.error(`Failed to fetch user`);
                    throw new Error(error.message);
                });
            console.log("Picture is >>>>>>>>>>>>> ", picture)
            if (!email) throwError(ErrorTypes.EMAIL_NOT_FOUND);

            let user = await services.auth.loginThroughMethod(email);
            if (!user) {
                const createBody = {
                    email: email,
                    name: name,
                    userName: `${this.generateUserName(name)}`
                };
                user = await services.auth.register(createBody, SIgnINMethod.GOOGLE);
            }
            return successResponse(res, 200, "User LoggedIn Successfully!", user)

        } catch (error) {
            return handleError(res, error)
        }
    };

}