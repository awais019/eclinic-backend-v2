import express from "express";
import validateMiddleware from "../middlewares/validate";
import trycatchMiddleware from "../middlewares/trycatch";
import validators from "../validators/uploads.validator";
import controller from "../controllers/uploads.controller";

const router = express.Router();

router.post(
  "/",
  validateMiddleware(validators.upload),
  trycatchMiddleware(controller.upload)
);

export default router;
