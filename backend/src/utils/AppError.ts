// Custom Error Class
// Allows to attach status Code directly to our Error Messages

export class AppError extends Error{
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Indicates an expected error (like "Invalid Password")

        Error.captureStackTrace(this, this.constructor)
    }
}