import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel,{IOrder} from "../models/orderModel";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";
import { newOrder } from "../services/order.service";

// create order 
export const createOrder = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    try{

         const {courseId, payment_info} = req.body as IOrder;

         const user = await userModel.findById(req.user?._id);

         const courseExistInUser = user?.courses.some((course:any)=> course._id.toString() === courseId);

         if(courseExistInUser){
            return next(new ErrorHandler("You have already purshased this course", 400));
         }

         const course = await CourseModel.findById(courseId);

         if(!course){
             return next(new ErrorHandler("Course not found", 404));
        }

        const data:any ={
            courseId: course._id,
            userId: user?._id,
        };

        newOrder(data,res,next);

        const mailData ={
            order:{
                _id: course._id.slice(0,6),
                name: course.name,
                price: course.price,
                date : new Date().toLocaleDateString('en-US',{year:'numeric', month:'long', day:'numeric'}),

            }
        }

        const html = await ejs.renderFile(path.join(__dirname,'../mails/order-confirmation.ejs'),{order:mailData})


    }catch(error:any){
        return next(new ErrorHandler(error.message, 500));
    }
})