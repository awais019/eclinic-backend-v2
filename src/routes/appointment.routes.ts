import express from "express";
import authMiddleware from "../middlewares/auth";
import trycatchMiddleware from "../middlewares/trycatch";
import appointments from "../controllers/appointments.controller";

const router = express.Router();

router.post(
  "/create",
  authMiddleware(),
  trycatchMiddleware(appointments.create)
);

router.get(
  "/",
  authMiddleware(),
  trycatchMiddleware(appointments.getAppointments)
);

router.get(
  "/completed",
  authMiddleware(),
  trycatchMiddleware(appointments.getCompletedAppointments)
);

router.get(
  "/requests",
  authMiddleware(),
  trycatchMiddleware(appointments.getAppointmentRequests)
);

router.post(
  "/requests/accept",
  authMiddleware(),
  trycatchMiddleware(appointments.acceptAppointmentRequest)
);

router.post(
  "/requests/reject",
  authMiddleware(),
  trycatchMiddleware(appointments.rejectAppointmentRequest)
);

export default router;
