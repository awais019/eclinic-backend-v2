import express from "express";
import validateMiddleware from "../middlewares/validate";
import validators from "../validators/uploads.validator";

const router = express.Router();

router.post("/", validateMiddleware(validators.upload), async (req, res) => {
  res.send();
});

export default router;
