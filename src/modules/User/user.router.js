import {Router} from "express";
import {fileUpload, fileValidation} from "../../utils/multer.js";
import {validation} from "../../middleweres/validation.js";
import * as UserController from "./controller/user.js";
import * as UserValidation from "./user.validation.js";
import {asyncHandler} from "../../utils/ErrorHandling.js";
import authRouter from "./auth/auth.router.js";
import auth from "../../middleweres/auth.js";
import checkEmailConfirmation from "../../middleweres/confirmedEmail.js";
import checkIsAccountDeleted from "../../middleweres/isDeleted.js";

const router = Router();

router.use('/auth', authRouter)


router.get('/:id',
    asyncHandler(auth),
    checkIsAccountDeleted,
    checkEmailConfirmation,
    validation(UserValidation.getUserProfile),
    asyncHandler(UserController.getUserProfile)
);

router.put('/update',
    validation(UserValidation.updateUserProfile),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(UserController.updateUserProfile)
);


router.patch('/updateProfilePhoto',
    fileUpload(fileValidation.image).single('profilePhoto'),
    validation(UserValidation.update_or_add_Photo),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(UserController.updateUserProfilePhoto)
);


router.patch('/addCoverPhoto',
    fileUpload(fileValidation.image).single('coverPhoto'),
    validation(UserValidation.update_or_add_Photo),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(UserController.addUserCoverPhoto)
);

router.delete('/softDelete',
    validation(UserValidation.softDeleteUser),
    asyncHandler(auth),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(UserController.softDeleteUser)
)
export default router;
