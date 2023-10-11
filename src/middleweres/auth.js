import jwt from "jsonwebtoken";
import User from "../../database/models/User.js";
import {StatusCodes} from "http-status-codes";
const auth = async (req, res, next) => {

    const {authorization} = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
        return res.json({message: "In-valid bearer key"});
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
        return res.json({message: "In-valid token"});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({message: "In-valid token payload"});
    }
    const authUser = await User.findById(decoded.id);
    if (!authUser) {
        return res.status(StatusCodes.NOT_FOUND).json({message: "Not register account"});
    }
    req.user = authUser;
    return next();
};

export default auth;
