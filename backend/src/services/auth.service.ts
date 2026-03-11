import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

// Helper to generate the JWT Token
const signToken = (id: string) =>{
    return jwt.sign({id}, process.env.JWT_SECRET as string, {
        expiresIn:  (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "7d",
    });
}

export const registerUserService = async (userData: any) => {
    const {name, email, password} = userData;

    // Check if the email already exists
    const existingUser = await User.findOne({email})
    if (existingUser){
        throw new AppError('Email is already in use, please Login.', 400);
    }

    //  Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a user and store the hashed password
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    // Sign the token
    const token = signToken(user._id.toString());
    return {user, token}
}

export const loginUserService = async (userData: any)=> {
    const {email, password} = userData;

    // Find user (we use +password because we hid it by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user){
        throw new AppError('Invalid email or password', 401);
    }

    // Compare the plain-text password to the hashed database password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
        throw new AppError('Invalid email or password', 401);
    }

    // Sign the token
    const token = signToken(user._id.toString());
    return {user, token}

}

export const updateUserPasswordService = async (userId: string, data: any)=>{
    const {currentPassword, newPassword} = data;
    const currentUser = await User.findById(userId).select('+password')

    // Check if user exist or nit
    if (!currentUser){
        throw new AppError("User doesn't exist", 404);
    }

    // Compare the passwords
    const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isMatch){
        throw new AppError('Incorrect Password', 401);
    }

    //  Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Reassign the values on the user
    currentUser.password = hashedPassword;
    currentUser.passwordChangedAt = new Date();

    await currentUser.save()

    // Sign the token
    const token = signToken(userId)
    return {user: currentUser, token}
}