import {Schema, Types, model} from "mongoose";
import * as cloudinary from '../../src/utils/cloudinary.js';

const postSchema = new Schema(
    {
        content: {type: String},
        photos: [{type: Object}],
        videos: [{type: Object}],
        likes: [{type: Types.ObjectId, ref: "User"}],
        createdBy: {type: Types.ObjectId, ref: "User"},
        privacy: {type: String, enum: ['only_me', 'public'], default: 'public'}
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
        id: false,
    }
);
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId',
    justOne: false
});

// Delete photos and videos in post before deleting
postSchema.pre('deleteOne', async function (next) {
        this.model('Comment').deleteMany({postId: this._id});
        for (const mediaFile of this.photos) {
            await cloudinary.uploader.destroy(mediaFile.public_id, {resource_type: "image"});
        }
        for (const video of this.videos) {
            await cloudinary.uploader.destroy(video.public_id, {resource_type: "video"});
        }
        next();
    }
)
postSchema.post('findOne', async function (doc) {
        //populate createdBy
        if (doc) {
            await doc.populate(
                [
                    {
                        path: 'createdBy',
                        select: '_id firstName lastName profilePhoto isDeleted'
                    },
                    {
                        path: 'likes',
                        select: '_id firstName lastName profilePhoto',
                        justOne:false
                    },
                    {
                        path: 'comments',
                        select: '_id comment videos photos createdBy createdAt',
                        populate: [
                            {
                                path: 'createdBy',
                                select: '_id firstName lastName profilePhoto',
                            },
                            {
                                path: 'replies',
                                select: '_id content createdBy createdAt likes',
                                populate:
                                    [
                                        {
                                            path: 'createdBy',
                                            select: '_id firstName lastName profilePhoto',
                                            justOne: false,
                                        },
                                        {
                                            path: 'likes',
                                            select: '_id firstName lastName profilePhoto',
                                            justOne:false
                                        }
                                    ]
                            },
                            {
                                path: 'likes',
                                select: '_id firstName lastName profilePhoto',
                                justOne:false

                            },
                        ],
                    }
                ]
            )
        }
    }
)
const Post = model("Post", postSchema);
export default Post;


