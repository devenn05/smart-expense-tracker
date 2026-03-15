import mongoose, {Schema, Document} from "mongoose";

// Interface defining the User shape
export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    phoneNumber?: string; 
    alertPreferences: {
        email: boolean;
        whatsapp: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    passwordChangedAt?:Date;
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
    phoneNumber: { 
        type: String, 
        trim: true, 
        default: null 
    }, 
    alertPreferences: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false }
    },
    passwordChangedAt: {
        type: Date
    },
},{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
}
);

export const User = mongoose.model<IUser>('User', userSchema);