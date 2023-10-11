import  {Router} from "express";
import * as ReplyController from "./controller/reply.js";
import {asyncHandler} from "../../utils/ErrorHandling.js";
import auth from "../../middleweres/auth.js";
import checkIsAccountDeleted from "../../middleweres/isDeleted.js";
import {validation} from "../../middleweres/validation.js";
import * as ReplyValidation from "./reply.validation.js";

const router = Router();


router.post("/create/:commentId",
    validation(ReplyValidation.create),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(ReplyController.addReply)
);
router.put("/update/:replyId",
    validation(ReplyValidation.update),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(ReplyController.updateReply)
);
router.delete("/delete/:replyId",
    validation(ReplyValidation.deleteReply),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(ReplyController.deleteReply)
);
router.patch("/like/:replyId",
    validation(ReplyValidation.like_or_unlike),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(ReplyController.likeReply)
);
router.patch("/unlike/:replyId",
    validation(ReplyValidation.like_or_unlike),
    asyncHandler(auth),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(checkIsAccountDeleted),
    asyncHandler(ReplyController.unlikeReply)
);

export default router;
