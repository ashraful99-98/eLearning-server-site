import { mailOptions } from './../config/nodemailler';
import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/user.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { transporter } from "../config/nodemailler";
import ErrorHandler from '../utils/ErrorHandler';

interface IContactBody {
    name: string,
    email: string,
    subject: string,
    message: string;

}
export const contactHandler = CatchAsyncError(async(req: Request, res: Response, next:NextFunction) => {
    console.log(req.body);

    if(req.method === "POST"){
        const data= req.body;
        const {name, email} = req.body as IContactBody;
 
        if( !data.subject || !data.message){
            return next(new ErrorHandler("Bad request", 400));
        }

        try {
            await transporter.sendMail({
                      ...mailOptions,
                      subject: data.subject,
                      html:`
                      <!DOCTYPE html>
                      <html lang="en">
                      <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>CodeCanvas-Website</title>
                          <style type="text/css">
                              body{
                                  margin: 0;
                                  padding: 0;
                                  min-width: 100%;
                                  font-family: Arial, Helvetica, sans-serif;
                                  font-size: 16px;
                                  line-height: 1.5;
                                  background-color: #FAFAFA;
                                  color: #222222;
                              }
                              a{
                                  color: #000;
                                  text-decoration: none;
                              }
                              h1{
                                  font-size: 24px;
                                  font-weight: 700;
                                  line-height: 1.25;
                                  margin-top: 0;
                                  margin-bottom: 15px;
                                  text-align: center;
                      
                              }
                              .text-styles{
                                  font-weight: 700;
                                  margin-top: 10px;
                                  margin-bottom: 15px;
                                  text-align: start;
                              }
                              p{
                                  font-size: 16px;
                                  font-weight: 300;
                                  margin-top: 0;
                                  margin-bottom: 20px;
                              }
                              table td{
                                  vertical-align: top;
                              }
                              /* Layout*/
                              .email-wrapper{
                                  max-width: 600px;
                                  margin: 0 auto;
                              }
                              .email-header{
                                  background-color: #0070f3;
                                  padding: 24px;
                                  color:#ffff;
                              }
                              .email-body{
                                  background-color: #ffff;
                                  margin-left: 10px;
                              }
                              .email-footer{
                                  background-color: #f6f6f6;
                                  padding: 24px;
                              }
                              /* Button  */
                              .button{
                                  display: inline-block;
                                  background-color: #0070f3;
                                  color: #ffffff;
                                  font-style: 16px;
                                  text-align: center;
                                  text-decoration: none;
                                  padding: 12px 24px;
                                  border-radius: 4px;
                              }
                              
                          </style>
                      </head>
                      <body>
                          <div class="email-wrapper">
                              <div class="email-header">
                                  <h1>CodeCanvas website</h1>
                              </div>
                              <div class="email-body">        
                              <h3>Hello, ${data.name}</h3>
                              <p>Email: ${data.email}</p>
                              <h2>Subject: ${data.subject}</h2>
                              <p>Message: ${data.message}</p>
                              </div>
                              <div class="email-footer">
                                  <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support98@CodeCanvas.com">support@CodeCanvas.com</a></p>
                              </div>
                          </div>
                      </body>
                      </html>
                      `
            });
    
            return res.status(200).json({
                success: true,
                data,
            });
            
        } catch (error: any) {
            console.log(error);
            return next(new ErrorHandler(error.message, 500));
        }
    }
    return next(new ErrorHandler("Bad request", 400));

});