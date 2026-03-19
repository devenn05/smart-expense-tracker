import { Request, Response } from "express";
import {
    loginUserService,
    logoutUserService,
    updateUserPasswordService,
    refreshAccessTokenService,
    initiateRegistrationService,
    verifyOtpService,
    initiateForgotPasswordService,
    verifyAndResetPasswordService
} from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

// helper to send tokens via cookies
const sendTokenResponse = (
    userDoc: any,
    accessToken: string,
    refreshToken: string,
    statusCode: number,
    res: Response
) => {
    const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10);

    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    const refreshTokenExpires = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000);

    const isProduction = process.env.NODE_ENV === 'production';

    const commonCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax'
    };

    res.cookie('jwt', accessToken, { ...commonCookieOptions, expires: accessTokenExpires });
    res.cookie('refreshToken', refreshToken, { ...commonCookieOptions, expires: refreshTokenExpires });

    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.password;

    res.status(statusCode).json({
        success: true,
        user
    });
};

// login user
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await loginUserService(req.body);
    sendTokenResponse(user, accessToken, refreshToken, 200, res);
});

// logout user
export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    await logoutUserService(refreshToken);

    const isProduction = process.env.NODE_ENV === 'production';

    const clearCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
        expires: new Date(Date.now() + 10 * 1000)
    };

    res.cookie('jwt', 'loggedout', clearCookieOptions);
    res.cookie('refreshToken', 'loggedout', clearCookieOptions);

    res.status(200).json({
        success: true,
        message: 'User successfully logged out'
    });
});

// refresh access token using refresh token
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw new AppError('Refresh token is missing', 403);
    }

    const { accessToken } = await refreshAccessTokenService(refreshToken);

    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', accessToken, {
        expires: accessTokenExpires,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });

    res.status(200).json({ success: true, message: 'Token refreshed' });
});

// forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await initiateForgotPasswordService(req.body.email);
    res.status(200).json(result);
});

// reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await verifyAndResetPasswordService(req.body);
    res.status(200).json(result);
});

// update password for logged in user
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString()!;
    const { user, token } = await updateUserPasswordService(userId, req.body);

    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    const userObject = user.toObject();
    delete (userObject as any).password;

    const isProduction = process.env.NODE_ENV === 'production';

    res.status(200)
        .cookie('jwt', token, {
            expires: accessTokenExpires,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        })
        .json({
            success: true,
            user: userObject
        });
});

// get logged in user
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, user: req.user });
});

// start registration (send OTP)
export const initialRegister = asyncHandler(async (req: Request, res: Response) => {
    const response = await initiateRegistrationService(req.body);
    res.status(200).json({ success: true, ...response });
});

// verify OTP and complete registration
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await verifyOtpService(req.body);
    sendTokenResponse(user, accessToken, refreshToken, 201, res);
});