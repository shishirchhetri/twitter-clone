import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { getUserProfile, followUnfollowUser, getSuggestedUsers , updateUserProfile, getUserByFullName } from "../controllers/user.controller.js";

const router = express.Router();

//for getting the profile details of loggedin user
router.get("/profile/:username", protectRoute, getUserProfile);

//for suggestion user at sidebar
router.get("/suggested", protectRoute, getSuggestedUsers);

//for following and unfollowing user
router.post("/follow/:id", protectRoute, followUnfollowUser);

//updating logged in user details
router.post("/update", protectRoute, updateUserProfile);

//search user by fullName
router.get('/search/:fullName', getUserByFullName)

export default router;
