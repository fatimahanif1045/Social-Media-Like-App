const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');

const multer = require('multer');
const path = require('path');

// Profile picture upload (Multer storage configuration)
const profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profilePics');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const profilePicUpload = multer({ storage: profilePicStorage });

router.put("/update-user", authenticateToken, profilePicUpload.single('profilePicture'), userController.updateUser) //For profile picture upload

router.post('/user-signup', userController.userSignup);

router.post('/user-login', userController.userLogin);

router.get("/current-user", authenticateToken, userController.getCurrentUserDetails);

router.delete('/delete-user', authenticateToken, userController.deleteUser);

router.get('/user-videos', authenticateToken, userController.getAllUserVideos);

module.exports = router;
