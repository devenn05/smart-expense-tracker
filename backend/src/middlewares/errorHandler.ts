/**
 * Global Error Handling Middleware for Express.
 * This function catches all errors passed to next() throughout the application.
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // If the error doesn't have a status code (e.g., a standard JS Error), default to 500 (Internal Server Error)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handling Specific Database Errors
    if (err.name === 'CastError'){
        err = new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
    }

    // Send the API Response
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};