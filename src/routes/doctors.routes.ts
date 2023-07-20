import express from "express";
import constants from "../constants";
import validators from "../validators/doctors.validators";
import validateMiddleware from "../middlewares/validate";

const router = express.Router();

router.post("/register", validateMiddleware(validators.create), (req, res) => {
  res.status(constants.CREATED_CODE).send("Valid input");
});

export default router;
