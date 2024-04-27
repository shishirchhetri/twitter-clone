import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided, please login!" });
    }

    //verification of the token 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid token!" });
    }
    //return the data that is decoded without the password to the request
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "user not found!" });
    }

    //create the user property of the req object so that we can access in the getuser route
    req.user = user;

    next();
  } catch (error) {
    console.log("error in the protectRoute: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};
