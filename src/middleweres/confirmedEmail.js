import {StatusCodes} from "http-status-codes";
import {ErrorClass} from "../utils/ErrorClass.js";

const checkEmailConfirmation = async (req, res, next) => {
    const user = req.user
    if (!user.confirmEmail)
        return next(new ErrorClass("Email not confirmed",StatusCodes.FORBIDDEN));
    return next();
};

export default checkEmailConfirmation;
