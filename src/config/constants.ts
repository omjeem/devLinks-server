import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"
import { envConfig } from "./envConfigs";
import bcrypt from "bcryptjs";


export enum SIgnINMethod {
  MICROSOFT = "microsoft",
  GOOGLE = 'google',
  PASSWORD = 'password'
}


export enum TokenTypes {
  ACCESS = 'access',
  REFRESH = 'refresh',
  OTP = "otp"
}

export const AUTH_TOKEN = "token"


export const emailTemplateForOTP = (otp: number) => `
<div style="font-family: Arial, sans-serif; text-align: center; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
  <h1 style="color: #333; font-size: 24px;">Your OTP Code</h1>
  <p style="font-size: 16px;">Use the following One-Time Password (OTP) to proceed:</p>
  <p style="font-size: 32px; font-weight: bold; color: #0078d4; margin: 20px 0;">${otp}</p>
  <p style="font-size: 16px; color: #555;">This OTP is valid for <strong>10 minutes</strong>.</p>
  <p style="font-size: 14px; color: #777;">If you didn't request this code, you can safely ignore this email.</p>
</div>
`;


export const generateRandomUUID = () => {
  return uuidv4()
}

export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
}
export const hashString = (contact: string | number, otp: number | string) => {
  return `SAMPLE_OTP: ${contact}:${otp}`;
}


export function verifyOtpToken(token: string) {
  try {
    const decodedToken: any = jwt.verify(token, envConfig.jwt.secret)
    if (decodedToken.type !== TokenTypes.OTP) throw new Error()
    return decodedToken
  } catch (error) {
    throw new Error("Expired or Invalid Token")
  }
}

export const verifyOtpHash = (hash: string, contact: string, otp: string) => {
  const decryptedString = hashString(contact, otp);
  return bcrypt.compareSync(decryptedString, hash);
}

export const generateOtpToken = (email: string, otp: number) => {
  const saltRounds = 10;
  const decryptedString = hashString(email, otp);
  const encryptedString = bcrypt.hashSync(decryptedString, saltRounds);
  const signObj = {
    otp: encryptedString,
    email,
    type: TokenTypes.OTP
  }
  // const expireTime = moment.duration(Constants.otpExpireDurationInMin, 'minutes').asMilliseconds();
  const token = jwt.sign(signObj, envConfig.jwt.secret, { expiresIn: `${envConfig.jwt.expires}m` });
  return token;
}

