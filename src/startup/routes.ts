import { Express } from "express";
import index from "../routes/index.routes";
import patients from "../routes/patients.routes";
import doctors from "../routes/doctors.routes";

export default function (app: Express) {
  app.use("/api/", index);
  app.use("/api/patients", patients);
  app.use("/api/doctors", doctors);
}
