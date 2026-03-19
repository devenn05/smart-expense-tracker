import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import crypto from "crypto";
import { RefreshToken } from "../models/RefreshToken";
import { OtpRegistration } from "../models/OtpRegistration";
import {
    sendVerificationEmail,
    sendVerificationWhatsApp,
    sendPasswordResetEmail
} from "../utils/notifications";
import { OtpResetPassword } from "../models/OtpResetPassword";

// generate short-lived access token
const signAccessToken = (id: string) => {
  return jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );
};

// create and store refresh token in db
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

// login user
export const loginUserService = async (userData: any) => {
    const { email, password } = userData;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new AppError('Invalid email or password', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = await generateAndStoreRefreshToken(user._id.toString());

    return { user, accessToken, refreshToken };
};

// issue new access token using refresh token
export const refreshAccessTokenService = async (incomingRefreshToken: string) => {
    if (!incomingRefreshToken) {
        throw new AppError('Refresh token not found', 403);
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(incomingRefreshToken)
        .digest('hex');

    const tokenDoc = await RefreshToken.findOne({ token: hashedToken });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        if (tokenDoc) await tokenDoc.deleteOne();
        throw new AppError('Invalid or expired refresh token. Please log in again.', 403);
    }

    const newAccessToken = signAccessToken(tokenDoc.user.toString());

    return { accessToken: newAccessToken };
};

// logout user (remove refresh token)
export const logoutUserService = async (incomingRefreshToken: string) => {
    if (!incomingRefreshToken) return;

    const hashedToken = crypto
        .createHash('sha256')
        .update(incomingRefreshToken)
        .digest('hex');

    await RefreshToken.deleteOne({ token: hashedToken });
};

// send reset password OTP
export const initiateForgotPasswordService = async (email: string) => {
    const user = await User.findOne({ email });

    // don't expose whether user exists or not
    if (!user) {
        throw new AppError("If an account with this email exists, a reset code has been sent.", 200);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // store or update otp
    await OtpResetPassword.findOneAndUpdate(
        { email },
        { email, otp },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendPasswordResetEmail(email, user.name, otp);

    return { success: true, message: "Reset code dispatched." };
};

// verify otp and update password
export const verifyAndResetPasswordService = async (data: any) => {
    const { email, otp, newPassword } = data;

    const validRequest = await OtpResetPassword.findOne({ email });

    if (!validRequest || validRequest.otp !== otp) {
        throw new AppError('Invalid or expired OTP code', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new AppError('Critical mapping error. Contact support.', 404);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    // delete used otp
    await validRequest.deleteOne();

    return { success: true, message: "Password re-secured successfully!" };
};

// update password for logged in user
export const updateUserPasswordService = async (userId: string, data: any) => {
    const currentUser = await User.findById(userId).select('+password');

    if (!currentUser) {
        throw new AppError("User doesn't exist", 404);
    }

    const isMatch = await bcrypt.compare(data.currentPassword, currentUser.password);
    if (!isMatch) {
        throw new AppError('Incorrect Password', 401);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    currentUser.password = hashedPassword;
    currentUser.passwordChangedAt = new Date();

    await currentUser.save();

    const token = signAccessToken(userId);

    return { user: currentUser, token };
};

// generate 6 digit otp
const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

// start registration process
export const initiateRegistrationService = async (userData: any) => {
    const { name, email, password, phoneNumber } = userData;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email is already in use, please Login.', 400);
    }

    // check if phone number already used
    if (phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            throw new AppError('This WhatsApp number is already linked to another account.', 400);
        }
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailOtp = generateOTP();
    const whatsappOtp = undefined;

    // store temporary user data
    await OtpRegistration.findOneAndUpdate(
        { email },
        {
            name,
            email,
            passwordHash: hashedPassword,
            phoneNumber,
            emailOtp,
            whatsappOtp
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // send verification email
    await sendVerificationEmail(email, name, emailOtp);

    if (phoneNumber && whatsappOtp) {
        await sendVerificationWhatsApp(phoneNumber, whatsappOtp);
    }

    return {
        message: "Verification codes sent.",
        requiresWhatsAppOtp: false
    };
};

// verify otp and create actual user
export const verifyOtpService = async (data: any) => {
    const { email, emailOtp, whatsappOtp } = data;

    const tempRecord = await OtpRegistration.findOne({ email });
    if (!tempRecord) {
        throw new AppError('OTP expired or invalid. Please register again.', 400);
    }

    if (tempRecord.emailOtp !== emailOtp) {
        throw new AppError('Invalid Email OTP', 400);
    }

    // create user
    const user = await User.create({
        name: tempRecord.name,
        email: tempRecord.email,
        password: tempRecord.passwordHash,
        phoneNumber: tempRecord.phoneNumber,
        alertPreferences: {
            email: true,
            whatsapp: false
        }
    });

    // remove temp data
    await tempRecord.deleteOne();

    // generate tokens
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = await generateAndStoreRefreshToken(user._id.toString());

    return { user, accessToken, refreshToken };
};