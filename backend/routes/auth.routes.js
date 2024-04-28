import express from "express";
import {
  signup,
  login,
  logout,
  getUser,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getUser);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout",protectRoute, logout);

export default router;
