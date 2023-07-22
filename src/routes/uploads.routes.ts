import express from "express";
import validateMiddleware from "../middlewares/validate";
import validators from "../validators/uploads.validator";
import controller from "../controllers/uploads.controller";

const router = express.Router();

router.post("/", validateMiddleware(validators.upload), controller.upload);

export default router;
