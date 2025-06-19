const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const videoController = require('../controllers/videoController');
const authenticateToken = require('../middlewares/authenticateToken');

// Multer config for video uploads
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/video');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const videoUpload = multer({ storage: videoStorage });

// Video Upload Routes
router.post('/upload-video', authenticateToken, videoUpload.single('video'), videoController.uploadVideo);

router.get('/search-video', authenticateToken, videoController.searchVideos);

router.get('/get-videos', authenticateToken, videoController.getVideos);

router.delete('/delete-video', authenticateToken, videoController.deleteVideo);

router.post('/upload-video-device-id', videoController.uploadVideoDeviceId);

router.post('/upload-video-information', authenticateToken, videoController.uploadVideoInfo);

module.exports = router;
