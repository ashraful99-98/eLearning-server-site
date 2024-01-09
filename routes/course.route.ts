import { authorizeRoles, isAutheticated } from './../middleware/auth';
import  express  from "express";
import { addAnswer,
         addQuestion,
         addReplyToReview, 
         addReview, 
         deleteCourse, 
         editCourse, 
         generateVideoUrl, 
         getAllCourses,
         getAllCoursesControl, 
         getCourseByUser, 
         getSingleCourse, 
         uploadCourse 
        } from "../controllers/course.controller";
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

courseRouter.get("/get-all-courses",isAutheticated, authorizeRoles("admin"), getAllCoursesControl);

// courseRouter.put("/get-all-courses",isAutheticated, authorizeRoles("admin"), getAllCourses);

courseRouter.post(
        "/getVdoCipherOTP",
   generateVideoUrl
);

courseRouter.delete("/delete-course/:id",isAutheticated, authorizeRoles("admin"), deleteCourse);

export default courseRouter;