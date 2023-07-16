import express from "express";
import patients from "../controllers/patients.controller";
import validators from "../validators/patients.validator";
import validateMiddlware from "../middlewares/validate";

const router = express.Router();

router.post("/register", validateMiddlware(validators.create), patients.create);

export default router;
