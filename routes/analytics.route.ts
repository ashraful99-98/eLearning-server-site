import { updateAccessToken } from './../controllers/user.controller';
import { getCoursesAnalytics, getOrdersAnalytics, getUsersAnalytics } from '../controllers/analytics.controller';
import { authorizeRoles, isAutheticated } from './../middleware/auth';
import  express  from "express";


const analyticsRouter = express.Router();


analyticsRouter.get("/get-users-analytics",updateAccessToken,isAutheticated, authorizeRoles("admin"), getUsersAnalytics );

analyticsRouter.get("/get-courses-analytics",updateAccessToken,isAutheticated, authorizeRoles("admin"), getCoursesAnalytics );
analyticsRouter.get("/get-orders-analytics",updateAccessToken,isAutheticated, authorizeRoles("admin"), getOrdersAnalytics );


export default analyticsRouter;