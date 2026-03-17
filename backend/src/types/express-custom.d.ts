import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "../models/User.js";

declare global{
    namespace Express{
        export interface Request{
            // This allows us to use req.user in any protected controller safely
            user?: Omit<Document<unknown, any, IUser> & IUser & { _id: Types.ObjectId }, never>;
        }
    }
}