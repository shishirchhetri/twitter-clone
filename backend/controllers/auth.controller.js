import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

//signup
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "password length must be at least 6 characters long!" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    //creating the jwt token for new user, save to the db and send as cookie response to the client
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in the signup auth: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { password, username } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required!" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(400)
        .json({ error: "User with that username not found!" });
    }

    const correctPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!correctPassword) {
      return res.status(500).json({ error: "Password doesn't match" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error while logging in: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//logout
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.log("Error while logging out: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//getting the currently logged in user
export const getUser = async (req, res)=>{
    try{
        //req.user is provided by the middleware
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    }catch(error){
        console.log('error in getUser controller: ', error.message);
        res.status(500).json({error: 'Internal server error!'})
    }
}