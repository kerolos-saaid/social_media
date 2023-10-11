import {StatusCodes} from 'http-status-codes'
import Reply from "../../../../database/models/Reply.js";
import Comment from "../../../../database/models/Comment.js";

export const addReply = async (req, res, _) => {
    const {commentId} = req.params;
    const {reply} = req.body;
    let comment = await Comment.findById(commentId);
    if (!comment || comment?.createdBy?.isDeleted) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Comment not found'});
    }
    const replyObj = await Reply.create({reply, commentId, createdBy: req.user._id});
    return res.status(StatusCodes.OK).json({message: 'done', reply: replyObj});
}

export const updateReply = async (req, res, _) => {
    const userId = req.user._id;
    const {replyId} = req.params;
    const {reply} = req.body;
    const replyObj = await Reply.findById(replyId);
    if (!replyObj || replyObj?.createdBy?._id.toString() !== userId.toString()) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Reply not found'});
    }
    reply ? replyObj.reply = reply : null;
    await replyObj.save();
    return res.status(StatusCodes.OK).json({message: 'done', reply: replyObj});
}
export const deleteReply = async (req, res, _) => {
    const userId = req.user._id;
    const {replyId} = req.params;
    const replyObj = await Reply.findById(replyId);
    if (!replyObj || replyObj?.createdBy?._id.toString() !== userId.toString()) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Reply not found'});
    }
    await replyObj.deleteOne();
    return res.status(StatusCodes.OK).json({message: 'done'});
}

export const likeReply = async (req, res, _) => {
    const userId = req.user._id;
    const {replyId} = req.params;
    const reply = await Reply.findOne({_id: replyId});
    if (!reply || reply?.createdBy?._id.toString() !== userId.toString()) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Reply not found'});
    }
    for (const like of reply.likes) {
        if (like._id.toString() === userId.toString())
            return res.status(StatusCodes.CONFLICT).json({message: 'Already liked'});
    }
    reply.likes.push(req.user._id);
    await reply.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
}
export const unlikeReply = async (req, res, _) => {
    const userId = req.user._id;
    const {replyId} = req.params;
    const reply = await Reply.findOne({_id: replyId})
    if (!reply || reply?.createdBy.isDeleted === true) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Post not found'});
    }
    reply.likes.pop(userId);
    await reply.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
}