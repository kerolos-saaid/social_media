import {ErrorClass} from "./ErrorClass.js";

export const asyncHandler = (fn) =>
    (req, res, next) =>
        fn(req, res, next).catch((error) =>
            next(new ErrorClass(error.message, error.status || 500))
        );

export const globalErrorHandling = (error, req, res, _) => {
    const status = error.status || 500;
    return res.status(status).json({status, error: error.message});
};

