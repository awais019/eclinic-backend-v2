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

router.get(
  "/schedule",
  authMiddleware(),
  trycatchMiddleware(doctors.getFullSchedule)
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
  "/charges",
  [authMiddleware(), validateMiddleware(validators.charges)],
  trycatchMiddleware(doctors.setCharges)
);

router.get(
  "/charges",
  authMiddleware(),
  trycatchMiddleware(doctors.getCharges)
);

router.put(
  "/charges",
  [authMiddleware(), validateMiddleware(validators.charges)],
  trycatchMiddleware(doctors.updateCharges)
);

router.get("/", trycatchMiddleware(doctors.getDoctors));
router.get("/specializations", trycatchMiddleware(doctors.getSpecializations));

router.get("/:id", authMiddleware(), trycatchMiddleware(doctors.getDoctor));
router.get(
  "/:id/reviews",
  authMiddleware(),
  trycatchMiddleware(doctors.getReviews)
);
router.get(
  "/:id/schedule",
  authMiddleware(),
  trycatchMiddleware(doctors.getSchedule)
);
router.post(
  "/:id/timeSlots",
  authMiddleware(),
  trycatchMiddleware(doctors.getTimeSlots)
);

export default router;
