import {StatusCodes} from "http-status-codes";
import {ErrorClass} from "../utils/ErrorClass.js";

const checkIsAccountDeleted = async (req, res, next) => {
    const user = req.user
    if (user.isDeleted)
        return next(new ErrorClass("User not found",StatusCodes.FORBIDDEN));
    return next();
};
export default checkIsAccountDeleted;
