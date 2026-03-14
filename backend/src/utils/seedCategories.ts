import { Category } from "../models/Category";

// Define our baseline categories with their respective 'type' and Hex colors
const defaultCategories = [
    // --- Income Categories ---
    { name: 'Salary', type: 'income', color: '#10b981', isPredefined: true, user: null },
    { name: 'Business', type: 'income', color: '#059769', isPredefined: true, user: null },
    { name: 'Freelance', type: 'income', color: '#80bae3', isPredefined: true, user: null },
    { name: 'Investments', type: 'income', color: '#3b82f6', isPredefined: true, user: null },
    { name: 'Gifts & Refunds', type: 'income', color: '#8b5cf6', isPredefined: true, user: null },
    
    // --- Expense Categories ---
    { name: 'Housing & Rent', type: 'expense', color: '#f43f5e', isPredefined: true, user: null },
    { name: 'Food & Groceries', type: 'expense', color: '#f97316', isPredefined: true, user: null },
    { name: 'Utilities', type: 'expense', color: '#0ea5e9', isPredefined: true, user: null },
    { name: 'Transportation', type: 'expense', color: '#eab308', isPredefined: true, user: null },
    { name: 'Health & Medical', type: 'expense', color: '#14b8a6', isPredefined: true, user: null },
    { name: 'Entertainment', type: 'expense', color: '#ec4899', isPredefined: true, user: null },
    { name: 'Subscriptions', type: 'expense', color: '#6366f1', isPredefined: true, user: null },
    { name: 'Other', type: 'expense', color: '#9ca3af', isPredefined: true, user: null }
];

export const seedPredefinedCategories = async () => {
    try {
        // Count how many system categories currently exist in the database
        const count = await Category.countDocuments({ isPredefined: true });
        
        // If none exist, it means this is a fresh setup or a wiped DB. Inject them!
        if (count === 0) {
            console.log("No predefined categories found. Seeding database...");
            await Category.insertMany(defaultCategories);
            console.log("Predefined categories successfully seeded.");
        } else {
            console.log("Predefined categories exist. Skipping seed.");
        }
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
};