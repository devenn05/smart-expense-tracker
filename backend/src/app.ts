import express, {Application, Request, Response} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes'
import budgetRoutes from './routes/budget.routes'
import transactionRoutes from './routes/transaction.routes';
import analyticsRoutes from './routes/analytics.routes';

const app: Application = express();

app.use(helmet())
app.use(
    cors(({
        origin: process.env.FRONTEND_URL || `http://localhost:5173`, // URL After Hosting / default port
        credentials: true
    }))
);

// Payload Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Checkup API
app.get('/api/v1/health', (req: Request, res: Response)=>{
    res.status(200).json({ success: true, message: 'Server is actively running.' })
})

app.use('/api/v1/auth', authRoutes);;
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);


app.use(errorHandler);

export default app;