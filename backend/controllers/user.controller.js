import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

//get user profile controller
export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "user not found!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in userProfile controller: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//follow or unfollow the user controller
export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    //the user to whom the loggedin user follow/ unfollow
    const userToModify = await User.findById(id);

    //logged in user which we get from protectRoute
    const currentUser = await User.findById(req.user._id);

    if (!id || !currentUser) {
      res.status(404).json({ error: "user not found" });
    }

    //the current user id is in object form so convert to string
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "you can't follow or unfollow yourself!" });
    }

    //check the status of the user if he is already following or not
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow the user
      await User.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });

      //remove from the following of the current user
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      //respose message
      res.status(201).json({ message: "User unfollowed successfully!" });
    } else {
      //follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

      //update the following of the user
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      //send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id, //id from the params
      });
      await newNotification.save();

      res.status(201).json({ message: "User followed successfully!" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser controller: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//suggested user sidebar controller
export const getSuggestedUsers = async (req, res) => {
  try {
    //current user loggedin id
    const userId = req.user._id;

    //list of users whom the currently loggedin user follows
    const usersFollowedByMe = await User.findById(userId).select("following");

    //listing users excluding the currently logged in user to
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, //$ne = not equals
        },
      },
      { $sample: { size: 10 } }, //select only 10 user excuding the logged in
    ]);

    //exclude the currently logged in user and already following users from the list
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    //show only 4 users as suggestion
    const suggestedUsers = filteredUsers.slice(0, 4);
    //removing the password from the details of the suggested user object list
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in suggestedUsers controller: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//update user profile controller
export const updateUserProfile = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    if (!user) return res.status(400).json({ error: "User not found!" });

    //changing the current password
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      res.status(400).json({
        error: "Please provide both the current password and new password!",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res
          .status(404)
          .json({ error: "current password doesnot match!" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "new password must be at least 6 characters long!" });
      }

      //encrypting the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    //changing the profile image
    if (profileImg) {
      /*
      Deleting the previous image of the user 
      https://res.cloudinary.com/cloudname/image/upload/version/imageId.png
      is the url we get as profileImg / coverImgafter uploading the image to 
      the cloudinary, the below code first splits the url by '/' and then pops 
      out the latest that is imageId.png part and again splits it by '.' and 
      then takes the first onethat is imageId as we are using the [0] which 
      gurantees we get the imageid and finally the image with that id is 
      destroyed by the function below
      */
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      //uploading the new image in cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    //changing the cover image
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      //uploading the new image in cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    //updating the new updates to the user object if user provides the data
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    //saving the updates to the db
    user = await user.save();

    //setting the response password t0 null
    user.password = null;

    //returning the data to the user
    return res.status(201).json(user);
  } catch (error) {
    console.log("Error in updating user: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};
