import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/User";

// Describes the data stored inside the token.
interface jwtPayload{
    id: string
    iat: number
}

export const protect = asyncHandler( async (req: Request, res: Response, next: NextFunction)=>{
    let token;

    // We check for the cookie parser extracting the 'jwt' cookie
    if (req.cookies && req.cookies.jwt){
        token = req.cookies.jwt
    }
    if (!token){
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    };

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwtPayload;

    // Check if the user still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser){
        return next(
            new AppError('The user belonging to this token does no longer exist.', 401)
        )
    }

    if (currentUser.passwordChangedAt){
        const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
        if (decoded.iat < changedTimestamp){
            return next(
                new AppError("User recently changed password! Please log in again.", 401)
            )
        }
    }
    // We append the whole user document to the request object!
    req.user = currentUser;
    next();
})