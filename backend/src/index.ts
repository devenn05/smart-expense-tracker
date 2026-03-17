import app from "./app.js";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import { seedPredefinedCategories } from "./utils/seedCategories.js";
//import { whatsappClient } from "./services/whatsapp.service.js";

dotenv.config()

const PORT = process.env.PORT || 5000;

connectDB().then(async()=>{
    await seedPredefinedCategories();
    whatsappClient.initialize();
    app.listen(PORT, ()=>{
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    })
})