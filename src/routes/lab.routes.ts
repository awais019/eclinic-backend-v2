import express from "express";
import trycatch from "../middlewares/trycatch";
import labController from "../controllers/lab.controller";

const router = express.Router();

router.post("/", trycatch(labController.register));

export default router;
