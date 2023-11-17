import { Express } from "express";
import index from "../routes/index.routes";
import patients from "../routes/patients.routes";
import doctors from "../routes/doctors.routes";
import auth from "../routes/auth.routes";
import appointments from "../routes/appointment.routes";
import transactions from "../routes/transactions.routes";
import prescription from "../routes/prescription.routes";
import lab from "../routes/lab.routes";
import messages from "../routes/messages.routes";
import calls from "../routes/calls.routes";

export default function (app: Express) {
  app.use("/api/", index);
  app.use("/api/patients", patients);
  app.use("/api/doctors", doctors);
  app.use("/api/auth", auth);
  app.use("/api/appointments", appointments);
  app.use("/api/transactions", transactions);
  app.use("/api/prescription", prescription);
  app.use("/api/lab", lab);
  app.use("/api/messages", messages);
  app.use("/api/calls", calls);
}
