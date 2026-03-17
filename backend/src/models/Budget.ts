import mongoose, {Schema, Document} from "mongoose";

export interface IBudget extends Document{
    user: mongoose.Types.ObjectId;
    category: mongoose.Types.ObjectId;
    amount: number;
    createdAt: Date;
    updatedAt: Date
}

const budgetSchema: Schema<IBudget> = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please specify a budget amount'],
        min: [0, 'Budget cannot be negative']
    },
},
    {
        timestamps: true
    }
);

// Compound Index
// This allows us to safely use findOneAndUpdate with { upsert: true } later.
budgetSchema.index({user: 1, category: 1}, {unique: true});

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema)