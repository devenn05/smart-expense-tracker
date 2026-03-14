import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import crypto from "crypto";
import { RefreshToken } from "../models/RefreshToken";


// Helper to generate the JWT Token
const signAccessToken = (id: string) => {
  return jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );
};

// Helper Generate, store, and return the long-lived Refresh Token
const generateAndStoreRefreshToken = async (userId: string) => {
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpiresDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10);
    const expiresAt = new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000);

    // This code correctly instantiates your model. The pre-save hook will run automatically.
    const refreshTokenDoc = new RefreshToken({
        user: userId,
        token: rawRefreshToken,
        expiresAt,
    });
    await refreshTokenDoc.save();

    return rawRefreshToken;
};

export const registerUserService = async (userData: any) => {
    const {name, email, password} = userData;
    const existingUser = await User.findOne({email})
    if (existingUser){
        throw new AppError('Email is already in use, please Login.', 400);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = await generateAndStoreRefreshToken(user._id.toString());
    
    return {user, accessToken, refreshToken}
}

export const loginUserService = async (userData: any)=> {
    const {email, password} = userData;
    const user = await User.findOne({ email }).select('+password');
    if (!user){ throw new AppError('Invalid email or password', 401); }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){ throw new AppError('Invalid email or password', 401); }
    
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = await generateAndStoreRefreshToken(user._id.toString());
    
    return {user, accessToken, refreshToken}
}

// Service to handle Refreshing Tokens
export const refreshAccessTokenService = async (incomingRefreshToken: string) => {
    if (!incomingRefreshToken) {
        throw new AppError('Refresh token not found', 403);
    }
    const hashedToken = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');

    // This query works perfectly with your model
    const tokenDoc = await RefreshToken.findOne({ token: hashedToken });
    
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        if(tokenDoc) await tokenDoc.deleteOne();
        throw new AppError('Invalid or expired refresh token. Please log in again.', 403);
    }

    const newAccessToken = signAccessToken(tokenDoc.user.toString());
    return { accessToken: newAccessToken };
}

// Service to handle Logout
export const logoutUserService = async (incomingRefreshToken: string) => {
    if (!incomingRefreshToken) return;

    const hashedToken = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');
    await RefreshToken.deleteOne({ token: hashedToken });
}


export const updateUserPasswordService = async (userId: string, data: any)=>{
    const currentUser = await User.findById(userId).select('+password')

    if (!currentUser){
        throw new AppError("User doesn't exist", 404);
    }

    const isMatch = await bcrypt.compare(data.currentPassword, currentUser.password);
    if (!isMatch){
        throw new AppError('Incorrect Password', 401);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    currentUser.password = hashedPassword;
    currentUser.passwordChangedAt = new Date();
    await currentUser.save()

    const token = signAccessToken(userId)
    return {user: currentUser, token}
}