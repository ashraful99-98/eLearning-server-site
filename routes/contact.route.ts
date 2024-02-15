import { contactHandler } from '../controllers/contact.controller';
import { updateAccessToken } from '../controllers/user.controller';
import { authorizeRoles, isAutheticated } from './../middleware/auth';
import  express  from "express";

const contactRouter = express.Router();

contactRouter.post("/contact",updateAccessToken, isAutheticated, contactHandler);

export default contactRouter;