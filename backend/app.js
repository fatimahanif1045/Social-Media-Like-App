const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const path = require('path');

const videoRoutes = require('./routes/videoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const videoReactRoutes = require('./routes/videoReactRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeCommentRoutes = require('./routes/likeCommentRoutes');
const nearByPlacesRoutes = require('./routes/nearByPlacesRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// DB and middleware
connectDB();
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/user/videos', videoRoutes);
app.use('/api/user/report', reportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/videos', videoReactRoutes);
app.use('/api/user/videos', commentRoutes);
app.use('/api/user/videos', likeCommentRoutes);
app.use('/api', nearByPlacesRoutes);

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
