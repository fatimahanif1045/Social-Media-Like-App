const Comment = require('../models/comment');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const handleErrorResponse = require('../utils/handleErrorResponse'); 

exports.commentVideo = async (req, res) => {
    const { comment, video } = req.body;
    
    // Validate input
    if (!comment || !video) {
        return handleErrorResponse(res, "Comment and video ID are required", 400, "Missing required fields");
    }
    try {

        const data = {
            comment,
            video,
            user: req.user.id
        }
    
        /*  const dbVideo = await Video.findOne({ _id:video });
          if (!dbVideo) {
              return res.status(400).json({
                  success: false,
                  data: null,
                  message: "No video found",
                  error: {
                      STATUS: 400,
                      details: {
                          CODE: "NO_Video_FOUND",
                          MESSAGE: "No video found"
                      }
                  }
              });
          }
  */

        const newComment = await new Comment(data).populate('user');
        await newComment.save();
        res.status(201).json({
            success: true,
            data: {
                comment: newComment
            },
            message: "Successfully Commented on Video",
        });
    } catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        });
    }
};

// Check comments function
exports.checkComment = async (req, res) => {
    const { video } = req.body;

    // Validate input
    if (!video) {
        return handleErrorResponse(res, "Video ID is required", 400, "Missing video ID");
    }

    // Validate that the video ID is a valid ObjectId
    if (!ObjectId.isValid(video)) {
        return handleErrorResponse(res, "Invalid Video ID format", 400, "Invalid video ID");
    }

    try {
/*
        let commentVideo = await Comment.find({ video }).populate([
            { path: "user", select: "name" },
            { path: "video", select: "type , videoUrl" },
            {
                path: "likeComment",
                populate: { path: "user", select: "name" } 
            }
        ]);

        const likeVid = [];

        for (const obj of commentVideo) {
            // console.log("data", obj?._id);
            const likeCom = await LikeComment.find({ comment: obj?._id });
            // console.log("likeCom", likeCom);
            likeVid.push({ ...obj, likeComment: likeCom }); // Push the updated object to the array
        }

        console.log("commentVideo", likeVid);
*/
        const commentsWithLikes = await Comment.aggregate([
            { $match: { video: new ObjectId(video) } },  
            {
                $lookup: {
                    from: 'likecomments',
                    localField: '_id',
                    foreignField: 'comment',
                    as: 'likes'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $lookup: {
                    from: 'likecomments',
                    let: { commentId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$comment', '$$commentId'] } } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'likedByUsers'
                            }
                        },
                        {
                            $project: {
                                likedByUsers: { $arrayElemAt: ['$likedByUsers._id', 0] }
                            }
                        }
                    ],
                    as: 'likesDetails'
                }
            },
            {
                $project: {
                    comment: 1,
                    user: { $arrayElemAt: ['$userDetails.name', 0] },
                    likesCount: { $size: '$likes' },
                    likesDetails: { $map: { input: '$likesDetails', as: 'like', in: '$$like.likedByUsers' } },
                    timestamp: 1
                }
            }
        ]);
            
        if (!commentsWithLikes.length) {
            return handleErrorResponse(res, "No comments found for this video", 404, "No comments");
        }

        res.status(200).json({
            success: true,
            data: { comments: commentsWithLikes },
            message: "Comments retrieved successfully",
        });
    } catch (err) {
        console.error("Error retrieving comments:", err);
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        });
    }
};

exports.deleteComment = async (req, res) => {
    const { video, id } = req.body;
    try {
        const commentVideo = await Comment.findOne({ video }).populate('user');
        if (!commentVideo) {
            return res.status(404).json({
                success: false,
                message: "Invalid request, This Video have no comments.",
                error: `This Video have no comments.`
            })
        }

        const deleteComment = await Comment.findOne({ _id: id }).populate('user');
        if (!deleteComment) {
            return res.status(404).json({
                success: false,
                message: "Invalid request No comment found",
                error: `comment with id ${id} not found. No comment deleted.`
            })
        }

        if (deleteComment.user.email === req.user.email) {
            await Comment.deleteOne({ _id: id });
            res.status(200).json({
                success: true,
                message: "Comment deleted successfully",
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Invalid request",
                error: `You are not authorized to perform this action`
            })
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Video not found.",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        })
    }
};

exports.deleteAllComment = async (req, res) => {
    const { video } = req.body;
    try {
        const deleteComment = await Comment.findOne({ video });
        if (!deleteComment) {
            return res.status(404).json({
                success: false,
                message: "Invalid request, No comments found",
                error: `No comments found for this video. No comment deleted.`
            })
        }

        if (deleteComment.user.email === req.user.email) {

            await Comment.deleteMany({ video });
            res.status(200).json({
                success: true,
                message: "All Comments deleted successfully",
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Invalid request",
                error: `You are not authorized to perform this action`
            })
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Video not found.",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        })
    }
};    
     
exports.editComment = async (req, res) => {
    const { id ,comment} = req.body;
    const updateData = req.body;
    try {
        const commentVideo = await Comment.findOne({ _id:id }).populate('user');

        if (!commentVideo) {
          return res.status(404).json({
              success: false,
              message: "No comment found",
              error: {
                CODE: "NO_COMMENT_FOUND",
                MESSAGE: "No comment found"
            
              }
          });
      }

        if (commentVideo.user.email === req.user.email) {
            const updatedComment = await Comment.findOneAndUpdate({ _id:id }, updateData, { new: true }).populate('user');
            res.status(200).json({
                success: true,
                data: {
                    updatedComment
                },
                message: "Comment Updated Successfully",
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Invalid request",
                error: `You are not authorized to perform this action`
            })
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Video not found.",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        })
    }
};      
   
