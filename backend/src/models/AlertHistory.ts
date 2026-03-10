import mongoose, {Document, mongo, Schema} from "mongoose";

export interface IAlertHistory extends Document{
    user: mongoose.Types.ObjectId;
    category: mongoose.Types.ObjectId;
    alertType: 'BUDGET_EXCEEDED' | 'OVERSPENDING_ANOMALY';
    monthYear: string;
    createdAt: Date
}

const alertHistorySchema: Schema<IAlertHistory> = new Schema({
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
        alertType: {
            type: String,
            enum: ['BUDGET_EXCEEDED','OVERSPENDING_ANOMALY'],
            required: true
        },
        monthYear: {
            type: String, // E.g., "2024-05" ensures we track emails by specific month
            required: true,
        },
},
    {
        timestamps: true
    }
);

// To Ensure only ONE email is sent per alert type, per category, per user, per month
alertHistorySchema.index({user: 1, category: 1, alertType: 1, monthYear: 1});

export const AlertHistory = mongoose.model<IAlertHistory>('AlertHistory', alertHistorySchema);