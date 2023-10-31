import { authorizeRoles, isAutheticated } from './../middleware/auth';
import  express  from "express";
import { addAnswer, addQuestion, addReplyToReview, addReview, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";
const courseRouter = express.Router();


courseRouter.post("/create-course", isAutheticated, authorizeRoles("admin"),uploadCourse);

courseRouter.put("/edit-course/:id", isAutheticated, authorizeRoles("admin"),editCourse);

courseRouter.get("/get-course/:id", getSingleCourse);

courseRouter.get("/get-courses", getAllCourses);

courseRouter.get("/get-course-content/:id",isAutheticated, getCourseByUser);

courseRouter.put("/add-question",isAutheticated, addQuestion);

courseRouter.put("/add-answer",isAutheticated, addAnswer);

courseRouter.put("/add-review/:id",isAutheticated, addReview);

courseRouter.put("/add-reply",isAutheticated, authorizeRoles("admin"),addReplyToReview);

export default courseRouter;