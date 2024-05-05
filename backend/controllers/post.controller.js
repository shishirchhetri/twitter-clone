import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

import { v2 as cloudinary } from 'cloudinary';

//create a new post
export const createPost = async (req, res) => {
  try {
    //getting text and image for post from the frontend
    const { text } = req.body;
    let { img } = req.body;

    //getting userid from the middleware
    const userId = req.user._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'user not found!' });
    }

    // checking if the text and img is sent by the user for upload or not
    if (!text && !img) {
      return res
        .status(404)
        .json({ error: 'post must have either text or image' });
    }

    //uploading the image to the cloudinary
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    console.log('Error in creating post: ', error.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
};

//delete post controller
export const deletePost = async (req, res) => {
  try {
    //getting the postID from params
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'post not found' });
    }

    // checking if the user is eligible for deleting the post
    //post.user id provided by the database, req.user._id is provided by the middleware
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: 'you are not authorized to delete this post!' });
    }

    //making sure the image is deleted from the cloudinary as well
    if (post.img) {
      const imgId = post.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(imgId);
    }

    //deleting the post
    await Post.findByIdAndDelete(req.params.id);

    //returning the response to the user
    return res.status(201).json({ message: 'post deleted successfully!' });
  } catch (error) {
    console.log('Error in deleting post: ', error.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
};

//comment on a post
export const commentOnPost = async (req, res) => {
  try {
    //getting text from the frontend postId from params, userId from middleware
    const { text } = req.body;

    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res
        .status(404)
        .json({ error: 'text is required for the comment!' });
    }

    //checking if the post exists or not
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'post not found!' });
    }

    //creating comment obj to be pushed in the database
    const comment = {
      user: userId,
      text,
    };

    //saving to the database
    post.comments.push(comment);
    await post.save();

    const updatedComment = post.comments;

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.log('Error in commenting on a post: ', error.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
};

//like or unlike a post
export const likeUnlikePost = async (req, res) => {
  try {
    //from logged in user , middleware
    const userId = req.user._id;

    //from params
    const { id: postId } = req.params;

    //checking the existence of the post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'post not found!' });
    }

    //checking the liked list of the post
    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      //unlike a post, removing the logged in user's uerId from the likes array list
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });

      //updating the likedPost section of the current logged in user by removing postId
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      //remove the currently logged in user's id from the post.likes field
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      res.status(200).json(updatedLikes);
    } else {
      //like a post, adding the userId of logged in user to likes array
      post.likes.push(userId);
      await post.save();

      //updating the likedPost section of the current logged in user by adding postId
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      //create a notification to the post owner
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: 'like',
      });

      await notification.save();

      // add the currently logged in user's id from the post.likes field
      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log('Error in like or unlike post: ', error.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
};

//getting all posts
export const getAllPosts = async (req, res) => {
  try {
    //getting all the post while sorting the lastest one first
    // .populate('user') helps to get all the information of the user with the help of userId we have in the post db which is stored as user
    //.populate({path:'user', select:'-password'}) is used to remove the sensitive info of the user
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log('Error in getting all posts: ', error.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
};

//getting all the liked post of a user using the userId of the user
export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    //get all the posts which have the userId of the currently loggedin user in their liked section of db
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log('Error in getLikedPosts controller: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//get all the posts of a users which loggedin user follows
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'user not found!' });
    }

    const following = user.following;

    //searching for the userId in the following field of user db and sorting the latest followings first
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log(
      "Error in get following's feedPost controller: ",
      error.message,
    );
    res.status(500).json({ error: 'Internal server error' });
  }
};

//
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ error: 'user not found with that username' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getting user's posts: ", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
