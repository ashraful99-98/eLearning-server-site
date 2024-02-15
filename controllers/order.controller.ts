import { getAllCourses } from './course.controller';
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
import { getAllOrdersService, newOrder } from "../services/order.service";
import { redis } from '../utils/redis';
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// create order 
export const createOrder = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    try{

         const {courseId, payment_info} = req.body as IOrder;

         if(payment_info){
            if("id" in payment_info){
                const paymentIntentId = payment_info.id;

                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentIntentId
                );

                if(paymentIntent.status !== "succeeded"){
                    return next(new ErrorHandler("Payment not authorized!", 400));
                }
            }
         }

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
            payment_info
        };

        const mailData ={
            order:{
                _id: course._id.toString().slice(0,6),
                name: course.name,
                price: course.price,
                date : new Date().toLocaleDateString('en-US',{year:'numeric', month:'long', day:'numeric'}),

            }
        };
        const html = await ejs.renderFile(path.join(__dirname,'../mails/order-confirmation.ejs'),{order:mailData});

        try{
            if(user){
                await sendMail({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                })
            }
        }catch(error:any){
            return next(new ErrorHandler(error.message, 500));
        }

        user?.courses.push(course?._id);

        await redis.set(req.user?._id, JSON.stringify(user));

        await user?.save();

        await NotificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`
        });

        // course.purchased ? course.purchased += 1 : course.purchased;
        course.purchased = (course.purchased ?? 0) + 1;

        await course.save();

        newOrder(data, res, next);

    }catch(error:any){
        return next(new ErrorHandler(error.message, 500));
    }
});


// export const createOrder = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { courseId, payment_info } = req.body as IOrder;

//         // Check if payment_info exists and if it has an 'id' property
//         if (payment_info && "id" in payment_info) {
//             const paymentIntentId = payment_info.id;
//             const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//             // Check if payment was successful
//             if (paymentIntent.status !== "succeeded") {
//                 return next(new ErrorHandler("Payment not authorized!", 400));
//             }
//         }

//         // Find the user
//         const user = await userModel.findById(req.user?._id);

//         // Check if the user has already purchased the course
//         const courseExistInUser = user?.courses.some((course: any) => course._id.toString() === courseId);
//         if (courseExistInUser) {
//             return next(new ErrorHandler("You have already purchased this course", 400));
//         }

//         // Find the course
//         const course = await CourseModel.findById(courseId);
//         if (!course) {
//             return next(new ErrorHandler("Course not found", 404));
//         }

//         // Prepare order data
//         const data: any = {
//             courseId: course._id,
//             userId: user?._id,
//             payment_info
//         };

//         // Prepare email data
//         const mailData = {
//             order: {
//                 _id: course._id.toString().slice(0, 6),
//                 name: course.name,
//                 price: course.price,
//                 date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
//             }
//         };

//         // Render email template
//         const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), { order: mailData });

//         try {
//             // Send email
//             if (user) {
//                 await sendMail({
//                     email: user.email,
//                     subject: "Order Confirmation",
//                     template: "order-confirmation.ejs",
//                     data: mailData,
//                 });
//             }
//         } catch (error: any) {
//             return next(new ErrorHandler(error.message, 500));
//         }

//         // Add course to user's courses
//         user?.courses.push(course?._id);
//         await redis.set(req.user?._id, JSON.stringify(user));
//         await user?.save();

//         // Create a notification for the user
//         await NotificationModel.create({
//             user: user?._id,
//             title: "New Order",
//             message: `You have a new order from ${course?.name}`
//         });

//         // Increment course purchase count
//         course.purchased = (course.purchased ?? 0) + 1;
//         await course.save();

//         // Call newOrder function
//         newOrder(data, res, next);

//     } catch (error: any) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });



// get all orders --only admin

export const getAllOrders  = CatchAsyncError(async(req:Request,res:Response, next: NextFunction)=>{
    try{
        getAllOrdersService(res);  

    }catch(error:any){
        return next(new ErrorHandler(error.message, 500));
    }
});

// send stripe publishble key 
export const sendStripePublishableKey = CatchAsyncError(async(req:Request,res:Response, next: NextFunction)=>{

    res.status(200).json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    })

});

// new payment 
export const newPayment = CatchAsyncError(async(req:Request,res:Response, next: NextFunction)=>{
 try{
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metadata:{
            company:"E-Learning",
        },
        automatic_payment_methods:{
            enabled: true,
        }
    });

    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
    });

}catch(error:any){
    return next(new ErrorHandler(error.message, 500));
}
});

// update order status --only for admin 




