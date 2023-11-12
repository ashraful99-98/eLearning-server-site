import { createlayout, editLayout, getLayoutByType } from '../controllers/layout.controller';
import { authorizeRoles, isAutheticated } from './../middleware/auth';
import  express  from "express";

const layoutRouter = express.Router();


layoutRouter.post("/create-layout", isAutheticated, authorizeRoles("admin"), createlayout);

layoutRouter.put("/edit-layout", isAutheticated, authorizeRoles("admin"), editLayout);

layoutRouter.get("/get-layout", isAutheticated,getLayoutByType);


export default layoutRouter;