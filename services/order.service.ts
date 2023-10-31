import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../models/orderModel";


// create new order 
export const newOrder = CatchAsyncError(async(data:any, next:NextFunction, res: Response)=>{
  await OrderModel.create(data);

  res.status(200).json({
    success: true,
    order,
});

});
