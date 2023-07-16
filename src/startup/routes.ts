import { Express } from "express";
import index from "../routes/index.routes";

export default function (app: Express) {
  app.use("/api/", index);
}
