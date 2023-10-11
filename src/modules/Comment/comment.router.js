import  {Router} from "express";
import * as CommentController from "./controller/comment.js";
import {asyncHandler} from "../../utils/ErrorHandling.js";
import auth from "../../middleweres/auth.js";
import checkEmailConfirmation from "../../middleweres/confirmedEmail.js";
import checkIsAccountDeleted from "../../middleweres/isDeleted.js";
import {validation} from "../../middleweres/validation.js";
import * as CommentValidation from "./comment.validation.js";


const router = Router();


router.post("/create/:postId",
    validation(CommentValidation.create),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(CommentController.addComment)
);
router.put("/update/:commentId",
    validation(CommentValidation.update),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(CommentController.updateComment)
);
router.delete("/delete/:commentId",
    validation(CommentValidation.deleteComment),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(CommentController.deleteComment)
);
router.patch("/like/:commentId",
    validation(CommentValidation.like_or_unlike),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(CommentController.likeComment)
);
router.patch("/unlike/:commentId",
    validation(CommentValidation.deleteComment),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkEmailConfirmation),
    asyncHandler(CommentController.unlikeComment)
);

export default router;
