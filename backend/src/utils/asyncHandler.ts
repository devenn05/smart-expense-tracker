// This catches any asynchronous promise rejections automatically. 
// You wrap controllers in this so you never write a try/catch.

import { Request, Response, NextFunction } from "express";

export const asyncHandler = (fn: Function) =>{
    return (req: Request, res: Response, next: NextFunction)=>{
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};