import express from "express";
import validators from "../validators/doctors.validators";
import validateMiddleware from "../middlewares/validate";
import doctors from "../controllers/doctors.controller";
import trycatchMiddleware from "../middlewares/trycatch";

const router = express.Router();

router.post(
  "/register",
  validateMiddleware(validators.create),
  trycatchMiddleware(doctors.create)
);

export default router;
