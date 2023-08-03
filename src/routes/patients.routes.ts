import express from "express";
import patients from "../controllers/patients.controller";
import validators from "../validators/patients.validator";
import validateMiddlware from "../middlewares/validate";
import trycatchMiddlware from "../middlewares/trycatch";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.post(
  "/register",
  validateMiddlware(validators.create),
  trycatchMiddlware(patients.create)
);

router.post(
  "/appointment/book",
  [authMiddleware(), validateMiddlware(validators.bookAppointment)],
  trycatchMiddlware(patients.bookAppointment)
);

export default router;
