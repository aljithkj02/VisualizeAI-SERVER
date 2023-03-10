import { Router } from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Post from '../mongodb/models/post.js';
import authorize from '../middleware/authorization.js'

dotenv.config();

const router = Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// POST 
router.get('/', async (req, res) => {
    let skip = req.query.skip ? Number(req.query.skip) : 0;
    let limit = req.query.limit ? Number(req.query.limit) : 5;
    try {
        const posts = await Post.find({}).skip(skip).limit(limit).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, data: err.message });
    }
})

router.post('/', authorize, async (req, res) => {
    try {
        const { prompt, photo } = req.body;
        const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Post.create({
            name: req.user.name,
            prompt,
            photo: photoUrl.url,
            author_id: req.user._id
        })

        res.status(200).json({ success: true, data: newPost });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
})

router.delete('/:id', authorize, async (req, res) => {
    try {
        const id = req.params.id;
        let deletedPost = await Post.findOneAndDelete({ _id: id });

        res.status(200).json({ success: true, data: deletedPost });
    } catch (err) {
        res.status(500).json({ success: false, data: err.message });
    }
})

router.get('/profile-posts', authorize, async (req, res) => {
    try {
        const posts = await Post.find({ author_id: req.user._id}).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, data: err.message });
    }
})

router.get('/search', async (req, res) => { 
    const query = req.query.q;
    try {
        const posts = await Post.find({ prompt: { $regex: query, $options: '$i' }});

        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ success: false, data: err.message });
    }
})

router.get('/getone/:id', authorize, async (req, res) => {
    try {
        let id = req.params.id;
        const post = await Post.findOne({ _id: id});

        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, data: err.message });
    }
})

// COMMENT 
router.post('/comment', authorize, async (req, res) => {
    try {
        const { comment, id } = req.body;
        let post = await Post.findOne({ _id: id });
        let user = await Post.findOne({author_id: req.user._id});
        let commentObj = { 
            name: req.user.name,
            comment,
            image: user?.photo || null
        }
        post.comments.push(commentObj);
        let result = await Post.findOneAndUpdate({ _id: id }, post)
        res.status(200).json({ success: true, data: commentObj });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
})
export default router; 