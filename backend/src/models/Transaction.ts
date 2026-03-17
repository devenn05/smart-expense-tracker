import mongoose, {Schema, Document} from "mongoose";

export interface ITransaction extends Document{
    user: mongoose.Types.ObjectId;
    amount: number;
    category: mongoose.Types.ObjectId;
    type: 'income' | 'expense';
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date
}
const transactionSchema: Schema<ITransaction> = new Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add a transaction amount'],
        min: [0.01, 'Amount must be greater than 0']
    },
    category:{
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    type: {
        type: String,
        enum: ['income','expense'],
        required: [true, 'Transaction type is required']
    },
    description:{
        type: String,
        trim: true,
        maxlength: [100, 'Description cannot be more than 100 characters']
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
},
    {
        timestamps: true
    }
);

// Compound Index
// Indexing the user and date to speed up analytical queries
transactionSchema.index({user: 1, date: -1});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);