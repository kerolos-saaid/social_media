import {Router} from "express";
import * as PostController from "./controller/post.js";
import {asyncHandler} from "../../utils/ErrorHandling.js";
import auth from "../../middleweres/auth.js";
import checkEmailConfirmation from "../../middleweres/confirmedEmail.js";
import checkIsAccountDeleted from "../../middleweres/isDeleted.js";
import {fileUpload, fileValidation} from "../../utils/multer.js";
import {validation} from "../../middleweres/validation.js";
import * as PostValidation from "./post.validation.js";

const router = Router();

router.get("/all",
    validation(PostValidation.getAllPosts),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(PostController.getALlPosts)
)

router.get("/:postId",
    validation(PostValidation.getPost),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(PostController.getPost)
);


router.post("/create",
    fileUpload(
        [...fileValidation.image, ...fileValidation.video]).fields(
        [
            {name: "photos", maxCount: 10},
            {name: "videos", maxCount: 3},
        ]),
    validation(PostValidation.create),
    asyncHandler(auth),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(checkIsAccountDeleted),

    (PostController.createPost)
);
router.put('/update/:postId',
    fileUpload(
        [...fileValidation.image, ...fileValidation.video]).fields(
        [
            {name: "photos", maxCount: 10},
            {name: "videos", maxCount: 3},
        ]),
    validation(PostValidation.updatePost),
    asyncHandler(auth),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(PostController.updatePost)
)
router.delete('/delete/:postId',
    validation(PostValidation.deletePost),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(PostController.deletePost)
)

router.put('/like/:postId',
    validation(PostValidation.like_unlike_Post),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(PostController.likePost)
)
router.put('/unlike/:postId',
    validation(PostValidation.like_unlike_Post),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(PostController.unlikePost)
)
export default router;
