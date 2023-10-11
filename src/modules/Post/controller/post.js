import cloudinary from "../../../utils/cloudinary.js";
import Post from "../../../../database/models/Post.js";
import {StatusCodes} from "http-status-codes";
import {ErrorClass} from "../../../utils/ErrorClass.js";
import {ApiFeatures} from '../../../utils/apiFeatures.js'

export const createPost = async (req, res, _) => {
    const {_id} = req.user._id;
    const {content} = req.body;
    console.log(req.files)
    let {photos, videos} = req.files;
    if (photos?.length)
        photos = await Promise.all(
            photos.map(async (photo) => {
                    const {secure_url, public_id} = await cloudinary.uploader.upload(
                        photo.path,
                        {folder: `social-media/${req.user._id}/posts/`}
                    );
                    return {secure_url, public_id}
                }
            )
        );
    if (videos?.length)
        videos = await Promise.all(
            videos.map(async (video) => {
                    const {secure_url, public_id} = await cloudinary.uploader.upload(
                        video.path,
                        {folder: `social-media/${req.user._id}/posts/`, resource_type: "video"}
                    );
                    return {secure_url, public_id}
                }
            )
        )
    const newPost = await Post.create({
            content,
            photos,
            videos,
            createdBy: _id,
        }
    );
    return await res.status(StatusCodes.OK).json({message: 'done', post: newPost})
};

export const getPost = async (req, res, next) => {
    const {postId} = req.params;
    const userId = req.user._id
    const post = await Post.findOne({_id: postId , $or: [{createdBy: userId}, {privacy: "public"}]}, )
    if (!post.createdBy)
        return next(new ErrorClass('Post not found',StatusCodes.NOT_FOUND))
    if (post.createdBy.toString() !== req.user._id.toString() && post.privacy === 'only_me')
        return next(new ErrorClass('Unauthorized',StatusCodes.UNAUTHORIZED))
    return res.status(StatusCodes.OK).json({message: 'done', post});
}

export const updatePost = async (req, res, next) => {
    // Extract necessary information from the request
    const {postId} = req.params;
    let {content, deleteMedia,privacy} = req.body;
    let photos, videos;

    // Extract uploaded photos and videos from the request if available
    if (req.files) {
        photos = req.files.photos;
        videos = req.files.videos;
    }

    // Check if the post with the given postId exists
    const post = await Post.findById(postId);
    deleteMedia ? deleteMedia = JSON.parse(req.body.deleteMedia) : null;

    if (!post) {
        return next(new ErrorClass('Post not found',StatusCodes.NOT_FOUND))
    }

    // Check if the current user is the owner of the post
    if (post.createdBy.toString() !== req.user._id.toString()) {
        return next(new ErrorClass('Unauthorized',StatusCodes.UNAUTHORIZED))
    }

    // Check if there are videos or photos that the user wants to delete
    if (deleteMedia?.length) {
        for (const mediaFile of deleteMedia) {
            if (!(post.photos.some(photo => photo.public_id === mediaFile.public_id) || post.videos.some(video => video.public_id === mediaFile.public_id))) {
                return next(new ErrorClass(`Cannot delete this file`, StatusCodes.UNAUTHORIZED));
            }
        }
    }

    // Delete the videos or photos that the user wants to delete
    if (deleteMedia?.length) {
        for (const mediaFile of deleteMedia) {
            if (post.photos.some(photo => photo.public_id === mediaFile.public_id)) {
                await cloudinary.uploader.destroy(mediaFile.public_id, {resource_type: "image"});
                await Promise.all(
                    post.photos = post.photos.filter(photo => photo.public_id !== mediaFile.public_id)
                );
            }
            if (post.videos.some(video => video.public_id === mediaFile.public_id)) {
                await cloudinary.uploader.destroy(mediaFile.public_id, {resource_type: "video"});
                await Promise.all(
                    post.videos = post.videos.filter(video => video.public_id !== mediaFile.public_id)
                );
            }
        }
    }
    // Upload new photos if available
    if (photos?.length) {
        photos = await Promise.all(
            photos.map(async (photo) => {
                const {secure_url, public_id} = await cloudinary.uploader.upload(
                    photo.path,
                    {folder: `social-media/${req.user._id}/posts`}
                );
                return {secure_url, public_id};
            })
        );
    }

    // Upload new videos if available
    if (videos?.length) {
        videos = await Promise.all(
            videos.map(async (video) => {
                const {secure_url, public_id} = await cloudinary.uploader.upload(
                    video.path,
                    {folder: `social-media/${req.user._id}/posts`, resource_type: "video"}
                );
                return {secure_url, public_id};
            })
        );
    }

    // Update the post with new text content, photos, privacy, and videos
    content ? post.content = content : null;
    photos ? post.photos.push(...photos) : null;
    videos ? post.videos.push(...videos) : null;
    privacy ? post.privacy = privacy : null;
    await post.save();

    // Return a success response with the updated post object.
    return res.status(StatusCodes.OK).json({message: 'done', post});
}

export const deletePost = async (req, res, next) => {
    const {postId} = req.params;
    const post = await Post.findOne({_id: postId});
    if (!post)
        return next(new ErrorClass('Post not found',StatusCodes.NOT_FOUND))

    if (post.createdBy._id.toString() !== req.user._id.toString())
        return next(new ErrorClass('Unauthorized',StatusCodes.UNAUTHORIZED))

    await post.deleteOne();
    return res.status(StatusCodes.OK).json({message: 'done'});
}

export const getALlPosts = async (req, res, _) => {
    const userId = req.user._id;
    const mongooseQuery = Post.find({$or: [{createdBy: userId}, {privacy: "public"}]}).populate(
        [
            {
                path: "createdBy",
                select: '_id firstName lastName profilePhoto',
                match: {isDeleted: false}

            },
            {
                path: "comments",
                select: "_id comment createdAt -postId",
                populate: {
                    path: 'createdBy',
                    select: '_id firstName lastName profilePhoto'
                }
            },
            {
                path: "likes",
                select: '_id firstName lastName profilePhoto'
            }
        ]
    )
    const apiFeatures = await new ApiFeatures(mongooseQuery, req.query)
        .filter()
        .search()
        .sort()
        .inDate()
    const pagination = await apiFeatures.pagination()
    let posts = await apiFeatures.mongooseQuery
    // filter the posts whom author isDeleted == true
    posts = posts.filter(post => post.createdBy !== null);
    return res.status(StatusCodes.OK).json({message: 'done', pagination, posts});
}
export const likePost = async (req, res, next) => {
    const userId = req.user._id;
    const {postId} = req.params;
    const post = await Post.findOne({_id: postId})
    if (!post || post.createdBy.isDeleted === true) {
        return next(new ErrorClass('Post not found',StatusCodes.NOT_FOUND))
    }
    for (const like of post.likes) {
        if (like._id.toString() === userId.toString())
            return res.status(StatusCodes.CONFLICT).json({message: 'Already liked'});
    }
    post.likes.push(userId);
    await post.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
}

export const unlikePost = async (req, res, next) => {
    const userId = req.user._id;
    const {postId} = req.params;
    const post = await Post.findOne({_id: postId})
    if (!post || post.createdBy.isDeleted === true) {
        return next(new ErrorClass('Post not found',StatusCodes.NOT_FOUND))
    }
    post.likes.pop(userId);
    await post.save();
    return res.status(StatusCodes.OK).json({message: 'done'});
}

