import mongoose from "mongoose";

export const connectDB = async () =>{
    try{
        const connect = await mongoose.connect(process.env.MONGO_URL as string);
        console.log(`✅ MongoDB Connected: ${connect.connection.host}`);
    } catch (error){
        console.error(`❌ Error connecting to MongoDB: ${(error as Error).message}`);
        process.exit(1);
    }
}