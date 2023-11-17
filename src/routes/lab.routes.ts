import express from "express";
import trycatch from "../middlewares/trycatch";
import labController from "../controllers/lab.controller";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.post("/", trycatch(labController.register));

router.post("/signin", trycatch(labController.signIn));

router.get("/", labController.getLabs);

export default router;
