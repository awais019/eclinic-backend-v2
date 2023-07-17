import express from "express";
import patients from "../controllers/patients.controller";
import validators from "../validators/patients.validator";
import validateMiddlware from "../middlewares/validate";
import trycatchMiddlware from "../middlewares/trycatch";

const router = express.Router();

router.post(
  "/register",
  validateMiddlware(validators.create),
  trycatchMiddlware(patients.create)
);

export default router;
