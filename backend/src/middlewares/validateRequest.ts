import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { ZodObject, ZodError} from 'zod';

// A dynamic middleware that accepts any Zod Schema
export const validate = (schema: ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validates the incoming request against the schema provided
            await schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            if (error instanceof(ZodError)){
                // Formats the messy Zod errors into a clean, single readable string for the frontend
                const errorMessage = error.issues.map(err => {
                    const field = err.path.join('.'); 
                    // Removes 'body.' from the prefix for cleaner frontend error reading
                    return `${field.replace('body.', '')}: ${err.message}`;
                }).join(' | ');
                return next(new AppError(errorMessage, 400));
            }
            next(error);
        }
    }
};