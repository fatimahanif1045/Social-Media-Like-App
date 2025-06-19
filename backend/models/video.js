const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoName: { type: String, required: true },
    thumbnailName: { type: String },
    watermarkedVideoName: { type: String },
    title: { type: String },  
    description: { type: String }, 
    tag: [{ type: String }],  
    //Moderation score
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    deviceId: { type: String },
    comment: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
    videoReact: [{ type: mongoose.Schema.ObjectId, ref: 'VideoReact' }],
    date: { type: Date, default: Date.now },
});

//const Video = mongoose.model('Video', videoSchema); 
module.exports = mongoose.model('Video', videoSchema);
