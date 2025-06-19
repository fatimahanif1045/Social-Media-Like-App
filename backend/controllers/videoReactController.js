const VideoReact = require('../models/videoReact');
const Video = require('../models/video');

exports.reactVideo = async (req, res) => {
    const { video } = req.body;
    try {
        const data = {
            video: video,
            user: req.user.id
        }
        let videoExist = await Video.findOne({ _id: video });
        if (!videoExist) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "No video found",
                error: {
                    STATUS: 400,
                    details: {
                        CODE: "NO_VIDEO_FOUND",
                        MESSAGE: "No video found"
                    }
                }
            });
        }
        let videoReact = await VideoReact.findOne(data);
        if (videoReact) {
            videoReact = await VideoReact.deleteOne(data)
            return res.status(200).json({
                success: true,
                message: "React removed from this Video",
            });
        }
        videoReact = await new VideoReact(data).populate('video');
        await videoReact.save();
        res.status(201).json({
            success: true,
            data: {
                videoReact
            },
            message: "Successfully Reacted on Video",
        });
    } catch (err) {
        console.log("error", err)
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        })
    }
};

exports.checkReact = async (req, res) => {
    const { video } = req.body;
    try {
        let videoExist = await Video.findOne({ _id: video });
        if (!videoExist) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "No video found",
                error: {
                    STATUS: 400,
                    details: {
                        CODE: "NO_VIDEO_FOUND",
                        MESSAGE: "No video found"
                    }
                }
            });
        }
        const reactedVideo = await VideoReact.findOne({ video }).populate([
            { path: "user", select: "name" },
            { path: "video", select: "type , videoUrl" },
        ]);
        // console.log("video",reactedVideo)
        if (!reactedVideo) {
             res.status(200).json({
                success: true,
                data: null,
                message: "No React on this video found"
            });
        }
        else {
            res.status(200).send({
                success: true,
                data: {
                    reactedVideo
                },
                message: "React on this Video",
            }
            );
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        })
    }
};

exports.allReactsForVideo = async (req, res) => {
    const videoId = req.query.video;
    try {
        // Validate input
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Video ID is required",
                error: {
                    STATUS: 400,
                    CODE: "MISSING_VIDEO_ID",
                    MESSAGE: "Please provide a valid video ID"
                }
            });
        }

        // Check if video exists
        const videoExists = await Video.findById(videoId);
        if (!videoExists) {
            return res.status(404).json({
                success: false,
                message: "Video not found",
                error: {
                    STATUS: 404,
                    CODE: "VIDEO_NOT_FOUND",
                    MESSAGE: "No video found with the provided ID"
                }
            });
        }

        // Get all reactions for the video
        const reacts = await VideoReact.find({ video: videoId }).populate({
            path: "user",
            select: "name userName profilePicture" // include fields you want
        });

        res.status(200).json({
            success: true,
            data: {
                reactedVideo: reacts
            },
            message: "Reacts fetched successfully"
        });

    } catch (err) {
        console.error("Error in allReactsForVideo:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        });
    }
};
