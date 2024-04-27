import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

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

//suggested user sidebar route
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
    const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
    //show only 4 users as suggestion
    const suggestedUsers = filteredUsers.slice(0, 4);
    //removing the password from the details of the suggested user object list
    suggestedUsers.forEach(user => user.password = null)

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in suggestedUsers controller: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};
