import express from "express";
import authMiddleware from "../middlewares/auth";
import prescription from "../controllers/prescription.controller";
import trycatchMiddleware from "../middlewares/trycatch";

const router = express.Router();

router.post("/", authMiddleware(), trycatchMiddleware(prescription.create));

export default router;
