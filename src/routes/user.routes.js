import { Router } from "express";
import { loggedOut, loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

//for injecting the middleware just use the method which is used in multer then use that before the registerUser which here is used here upload is used from multer 
const router=Router ()
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT,loggedOut)


export default router