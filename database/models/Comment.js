import {Schema, Types, model} from "mongoose";

const commentSchema = new Schema(
    {
        comment: {type: String,required: true},
        createdBy: {type: Types.ObjectId, ref: "User",required: true},
        postId: {type: Types.ObjectId, ref: "Post",required: true},
        likes: [{type: Types.ObjectId, ref: "User"}],
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
        id: false,
    }
);
commentSchema.post('findOne', async function (doc) {
        //populate createdBy
        if (doc) {
            await doc.populate(
                [
                    {
                        path: 'createdBy',
                        select: '_id firstName lastName profilePhoto',
                    },
                    {
                        path: 'likes',
                        select: '_id firstName lastName profilePhoto',
                        justOne:false
                    },
                    {
                        path: 'replies',
                        select: '_id reply createdBy createdAt',
                    }
                ]
            )
        }
    }
)
commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'replies',
    justOne: false
});

const Comment = model("Comment", commentSchema);
export default Comment;


