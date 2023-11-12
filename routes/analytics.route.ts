import { getCoursesAnalytics, getOrdersAnalytics, getUsersAnalytics } from '../controllers/analytics.controller';
import { authorizeRoles, isAutheticated } from './../middleware/auth';
import  express  from "express";


const analyticsRouter = express.Router();


analyticsRouter.get("/get-users-analytics",isAutheticated, authorizeRoles("admin"), getCoursesAnalytics );

analyticsRouter.get("/get-courses-analytics",isAutheticated, authorizeRoles("admin"), getUsersAnalytics );
analyticsRouter.get("/get-orders-analytics",isAutheticated, authorizeRoles("admin"), getOrdersAnalytics );


export default analyticsRouter;