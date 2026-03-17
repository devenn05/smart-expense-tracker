import mongoose, {Schema, Document} from "mongoose";

// Interface for Category
export interface ICategory extends Document {
    name: string,
    type: 'income' | 'expense',
    color?: string,  // Hex color for the UI charts
    isPredefined: boolean, //  Distinguishes system vs custom categories
    user: mongoose.Types.ObjectId | null;  // // Null if predefined, User ID if custom 
}

// Mongoose Schema definition
const categorySchema: Schema<ICategory> = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Category type is required']
    },
    color: {
        type: String,
        default: '#8ad157'
    },
    isPredefined: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User', // Establishes a relationship with the User table
        default: null
    },
},
    {
    timestamps: true
    }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
