import {Router} from "express";
import {asyncHandler} from "../../../utils/ErrorHandling.js";
import {fileUpload, fileValidation} from "../../../utils/multer.js";
import {validation} from "../../../middleweres/validation.js";
import * as AuthController from "./controller/auth.js";
import * as AuthValidation from "./auth.validation.js";
import auth from "../../../middleweres/auth.js";
import checkIsAccountDeleted from "../../../middleweres/isDeleted.js";

const router = Router();

router.post('/signup',
    fileUpload(fileValidation.image).fields([
        {name: "profilePhoto", maxCount: 1},
        {name: "coverPhoto", maxCount: 1},
    ]),
    validation(AuthValidation.signup),
    asyncHandler(AuthController.signup)
)
router.get('/signin',
    validation(AuthValidation.signin),
    asyncHandler(AuthController.signin)
)
router.get('/refresh',
    validation(AuthValidation.refresh),
    asyncHandler(AuthController.refresh)
)

router.patch('/confirmEmail',
    asyncHandler(auth),
    checkIsAccountDeleted,
    validation(AuthValidation.confirmEmail),
    asyncHandler(AuthController.confirmEmail)
)

router.patch('/updatePassword',
    validation(AuthValidation.updatePassword),
    asyncHandler(auth),
    asyncHandler(AuthController.updatePassword)
)

router.post('/forgetPassword',
    validation(AuthValidation.forgetPassword),
    asyncHandler(AuthController.forgetPassword)
)

router.patch('/resetPassword',
    validation(AuthValidation.resetPassword),
    asyncHandler(AuthController.resetPassword)
)

export default router;
