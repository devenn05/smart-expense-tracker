import { Request, Response } from "express";
import { registerUserService, loginUserService, logoutUserService,  updateUserPasswordService, refreshAccessTokenService, initiateRegistrationService, verifyOtpService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const sendTokenResponse = (userDoc: any, accessToken: string, refreshToken: string, statusCode: number, res: Response)=>{
    const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10);
    
    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for access token cookie
    const refreshTokenExpires = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000);

    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
    };

    res.cookie('jwt', accessToken, { ...commonCookieOptions, expires: accessTokenExpires });
    res.cookie('refreshToken', refreshToken, { ...commonCookieOptions, expires: refreshTokenExpires });
    
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.password;

    res.status(statusCode).json({
        success: true, user
    });
};

export const register = asyncHandler(async (req: Request, res: Response)=>{
    const {user, accessToken, refreshToken} = await registerUserService(req.body);
    sendTokenResponse(user, accessToken, refreshToken, 201, res);
});

export const login = asyncHandler(async (req:Request, res: Response)=>{
    const {user, accessToken, refreshToken} = await loginUserService(req.body);
    sendTokenResponse(user, accessToken, refreshToken, 200, res);
});

export const logout = asyncHandler(async ( req: Request, res: Response)=>{
    const { refreshToken } = req.cookies;
    await logoutUserService(refreshToken);

    // Clear both cookies
    res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.cookie('refreshToken', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });

    res.status(200).json({ success: true, message: 'User successfully logged out' });
});

// Controller to handle token refreshing
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new AppError('Refresh token is missing', 403);
    }
    const { accessToken } = await refreshAccessTokenService(refreshToken);

    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    res.cookie('jwt', accessToken, {
        expires: accessTokenExpires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
    });

    res.status(200).json({ success: true, message: 'Token refreshed' });
});


export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString()!
    const {user, token} = await updateUserPasswordService(userId, req.body);
    
    // updatePassword doesn't need to re-issue a refresh token.
    // It just gives a new short-lived access token.
    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    const userObject = user.toObject();
    delete (userObject as any).password;

    res.status(200).cookie('jwt', token, {
        expires: accessTokenExpires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
    }).json({
        success: true, user: userObject
    });
});

export const getMe = asyncHandler( async(req: Request, res: Response)=>{
    res.status(200).json({ success: true, user: req.user });
})

export const initialRegister = asyncHandler(async (req: Request, res: Response) => {
    const response = await initiateRegistrationService(req.body);
    res.status(200).json({ success: true, ...response });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await verifyOtpService(req.body);
    sendTokenResponse(user, accessToken, refreshToken, 201, res);
});