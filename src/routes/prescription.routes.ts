import express from "express";
import authMiddleware from "../middlewares/auth";
import prescription from "../controllers/prescription.controller";
import trycatchMiddleware from "../middlewares/trycatch";

const router = express.Router();

router.get("/", authMiddleware(), trycatchMiddleware(prescription.create));

export default router;
