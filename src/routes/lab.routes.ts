import express from "express";
import trycatch from "../middlewares/trycatch";
import labController from "../controllers/lab.controller";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.post("/", trycatch(labController.register));

router.get("/tests", authMiddleware(), trycatch(labController.getTests));

router.post("/signin", trycatch(labController.signIn));

router.get("/", authMiddleware(), trycatch(labController.getLabs));

router.post("/test", authMiddleware(), trycatch(labController.requestTest));

router.post(
  "/report/:testId",
  authMiddleware(),
  trycatch(labController.uploadReport)
);

export default router;
