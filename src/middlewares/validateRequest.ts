import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ErrorTypes, handleError, throwError } from "../config/error";
import { verifyTokenAndGetPayload } from "../config/token";

export const validateRequest =
    (schema: AnyZodObject) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const sanitizedValues = await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                req.body = sanitizedValues.body;
                Object.assign(req.query, sanitizedValues.query);
                Object.assign(req.params, sanitizedValues.params);
                return next();
            } catch (error) {
                console.log("Error is >>>>>>>>> ", error)
                const validationErrors: { [key: string]: string } = {};

                (error as ZodError).errors?.forEach((errorMessage) => {
                    const fieldName = errorMessage.path.join(".");
                    validationErrors[fieldName] = errorMessage.message;
                });

                res.status(400).json({ errors: validationErrors });
            }
        };

export const authMiddleware: any = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const beareeAuth = req.headers.authorization;
        if (!beareeAuth) {
            throwError(ErrorTypes.INVALID_TOKEN);
        }
        const token = beareeAuth.split(" ")[1]
        if (!token) {
            throwError(ErrorTypes.INVALID_TOKEN);
        }
        const decoded: any = verifyTokenAndGetPayload(token);
        if (!decoded || !decoded.valid) {
            throwError(ErrorTypes.INVALID_TOKEN);
        }
        req["user"] = decoded.payload;
        next();
    } catch (error) {
        return handleError(res, error);
    }
};