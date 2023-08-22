import { Express } from "express";
import index from "../routes/index.routes";
import patients from "../routes/patients.routes";
import doctors from "../routes/doctors.routes";
import auth from "../routes/auth.routes";
import appointments from "../routes/appointment.routes";

export default function (app: Express) {
  app.use("/api/", index);
  app.use("/api/patients", patients);
  app.use("/api/doctors", doctors);
  app.use("/api/auth", auth);
  app.use("/api/appointments", appointments);
}
