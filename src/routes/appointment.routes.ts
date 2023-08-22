import express from "express";
import authMiddleware from "../middlewares/auth";
import trycatchMiddleware from "../middlewares/trycatch";
import appointments from "../controllers/appointments.controller";

const router = express.Router();

router.post("/create", authMiddleware(), trycatchMiddleware(appointments));

export default router;
