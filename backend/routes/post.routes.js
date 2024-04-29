import express from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';

import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/post.controller.js'

const router = express.Router();

//create a new post 
router.post('/create', protectRoute, createPost);

//get all the posts of the logged in user
router.get('/user/:username',protectRoute, getUserPosts);

//delete the post
router.delete('/:id', protectRoute, deletePost);

//comment in a post
router.post('/comment/:id', protectRoute, commentOnPost);

//like or unlike post
router.post('/like/:id', protectRoute, likeUnlikePost);

//get all posts
router.get('/all',protectRoute, getAllPosts);

//get all posts of the following users
router.get('/following',protectRoute, getFollowingPosts);

//get all liked posts of a user
router.get('/likes/:id', protectRoute,getLikedPosts)

export default router;