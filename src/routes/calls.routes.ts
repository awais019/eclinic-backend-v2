import express from "express";
import authMiddleware from "../middlewares/auth";
import trycatchMiddleware from "../middlewares/trycatch";
import calls from "../controllers/calls.controller";

const router = express.Router();

router.post("/:userId", authMiddleware(), trycatchMiddleware(calls.createCall));

export default router;
