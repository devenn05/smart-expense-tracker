import { Request, Response } from "express";
import { registerUserService, loginUserService, updateUserPasswordService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

const sendTokenResponse = (userDoc: any, token: string, statusCode: number, res: Response)=>{
    const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10);
    const cookieOptions = {
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
    }
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.password;

    res.status(statusCode).cookie('jwt', token, cookieOptions).json({
        success: true, user
    });
};

export const register = asyncHandler(async (req: Request, res: Response)=>{
    const {user, token} = await registerUserService(req.body);
    sendTokenResponse(user, token, 201, res);
});

export const login = asyncHandler(async (req:Request, res: Response)=>{
    const {user, token} = await loginUserService(req.body);
    sendTokenResponse(user, token, 200, res);
});

export const logout = asyncHandler(async ( req: Request, res: Response)=>{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'User successfully logged out' });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString()!
    const {user, token} = await updateUserPasswordService(userId, req.body);
    sendTokenResponse(user, token, 200, res);
})

export const getMe = asyncHandler( async(req: Request, res: Response)=>{
    res.status(200).json({ success: true, user: req.user });
})