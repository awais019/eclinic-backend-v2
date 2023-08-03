import express from "express";
import validators from "../validators/doctors.validators";
import validateMiddleware from "../middlewares/validate";
import authMiddleware from "../middlewares/auth";
import doctors from "../controllers/doctors.controller";
import trycatchMiddleware from "../middlewares/trycatch";

const router = express.Router();

router.post(
  "/register",
  validateMiddleware(validators.create),
  trycatchMiddleware(doctors.create)
);

router.post(
  "/schedule/set",
  [authMiddleware(), validateMiddleware(validators.schedule)],
  trycatchMiddleware(doctors.setSchedule)
);

router.post(
  "/schedule/update",
  [authMiddleware(), validateMiddleware(validators.schedule)],
  trycatchMiddleware(doctors.updateSchedule)
);

router.post(
  "/charges/set",
  [authMiddleware(), validateMiddleware(validators.charges)],
  trycatchMiddleware(doctors.setCharges)
);

export default router;
