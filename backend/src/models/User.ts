import mongoose, {Schema, Document} from "mongoose";

// Interface defining the User shape
export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose Schema definition
const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide your Name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your Email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
},{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
}
);

export const User = mongoose.model<IUser>('User', userSchema);