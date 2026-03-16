import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import crypto from "crypto";
import { RefreshToken } from "../models/RefreshToken";
import { OtpRegistration } from "../models/OtpRegistration";
import { sendVerificationEmail, sendVerificationWhatsApp } from "../utils/notifications";


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

    const refreshTokenDoc = new RefreshToken({
        user: userId,
        token: rawRefreshToken,
        expiresAt,
    });
    await refreshTokenDoc.save();

    return rawRefreshToken;
};

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

// Helper to generate a 6 digit code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const initiateRegistrationService = async (userData: any) => {
    const { name, email, password, phoneNumber } = userData;
    
    // 1. Ensure email isn't already fully registered
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('Email is already in use, please Login.', 400);

    // Ensure phone number isn't already linked to another account
    if (phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            throw new AppError('This WhatsApp number is already linked to another account.', 400);
        }
    }

    // 2. Hash password & Generate OTPs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const emailOtp = generateOTP();
    const whatsappOtp = phoneNumber ? generateOTP() : undefined;

    // 3. Save to Temporary Storage
    await OtpRegistration.findOneAndUpdate(
        { email },
        { name, email, passwordHash: hashedPassword, phoneNumber, emailOtp, whatsappOtp },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 4. Fire Notifications
    await sendVerificationEmail(email, name, emailOtp);
    if (phoneNumber && whatsappOtp) {
        await sendVerificationWhatsApp(phoneNumber, whatsappOtp);
    }

    return { message: "Verification codes sent.", requiresWhatsAppOtp: false };
};


export const verifyOtpService = async (data: any) => {
    const { email, emailOtp, whatsappOtp } = data;

    // 1. Find temporary record
    const tempRecord = await OtpRegistration.findOne({ email });
    if (!tempRecord) throw new AppError('OTP expired or invalid. Please register again.', 400);

    // 2. Validate OTPs
    if (tempRecord.emailOtp !== emailOtp) {
        throw new AppError('Invalid Email OTP', 400);
    }
    if (tempRecord.phoneNumber && tempRecord.whatsappOtp !== whatsappOtp) {
        throw new AppError('Invalid WhatsApp OTP', 400);
    }

    // 3. Create the Real User
    const user = await User.create({
        name: tempRecord.name,
        email: tempRecord.email,
        password: tempRecord.passwordHash,
        phoneNumber: tempRecord.phoneNumber,
        alertPreferences: {
            email: true,
            whatsapp: !!tempRecord.phoneNumber
        }
    });

    // 4. Delete the temp record so it can't be used again
    await tempRecord.deleteOne();

    // 5. Generate Login Tokens
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = await generateAndStoreRefreshToken(user._id.toString());
    
    return { user, accessToken, refreshToken };
};