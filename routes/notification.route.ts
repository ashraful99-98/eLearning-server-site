import express from 'express';
        
import { authorizeRoles, isAutheticated } from '../middleware/auth';
import { getNotification, updateNotification } from '../controllers/notification.controller';

const notificationRoute = express.Router();

notificationRoute.get("/get-all-notifications", isAutheticated, authorizeRoles("admin"),getNotification);

notificationRoute.put("/update-notification/:id", isAutheticated, authorizeRoles("admin"),updateNotification);

export default notificationRoute;