import {StatusCodes} from 'http-status-codes'
import Post from "../../../../database/models/Post.js";
import Comment from "../../../../database/models/Comment.js";

export const addComment = async (req, res, _) => {
    const {postId} = req.params;
    const {comment} = req.body;
    let post = await Post.findById(postId);
    if (!post || post?.createdBy?.isDeleted) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Post not found'});
    }
    const commentObj = await Comment.create({comment, postId, createdBy: req.user._id});
    return res.status(StatusCodes.OK).json({message: 'done', comment: commentObj});
}

export const updateComment = async (req, res, _) => {
    const userId = req.user._id;
    const {commentId} = req.params;
    const {comment} = req.body;
    const commentObj = await Comment.findById(commentId);
    if (!commentObj || commentObj?.createdBy?._id.toString() !== userId.toString()) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Comment not found'});
    }
    comment ? commentObj.comment = comment : null;
    await commentObj.save();
    return res.status(StatusCodes.OK).json({message: 'done', comment: commentObj});
}
export const deleteComment = async (req, res, _) => {
    const userId = req.user._id;
    const {commentId} = req.params;
    const commentObj = await Comment.findById(commentId);
    if (!commentObj || commentObj?.createdBy?._id.toString() !== userId.toString()) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Comment not found'});
    }
    await commentObj.deleteOne();
    return res.status(StatusCodes.OK).json({message: 'done'});
}

export const likeComment = async (req, res, _) => {
    const userId = req.user._id;
    const {commentId} = req.params;
    const comment = await Comment.findOne({_id:commentId});
    if (!comment || comment?.createdBy?._id.toString() !== userId.toString()) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Comment not found'});
    }
    for (const like of comment.likes) {
        if (like._id.toString() === userId.toString())
            return res.status(StatusCodes.CONFLICT).json({message: 'Already liked'});
    }
    comment.likes.push(req.user._id);
    await comment.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
}
export const unlikeComment = async (req, res, _) => {
    const userId = req.user._id;
    const {commentId} = req.params;
    const comment = await Comment.findOne({_id: commentId})
    if (!comment || comment?.createdBy.isDeleted === true) {
        return res.status(StatusCodes.NOT_FOUND).json({message: 'Post not found'});
    }
    comment.likes.pop(userId);
    await comment.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
}