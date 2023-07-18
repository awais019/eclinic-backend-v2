import cors from "cors";
import { Express } from "express";

export default function (app: Express) {
  const corsOptions = { exposedHeaders: "*" };
  app.use(cors(corsOptions));
}
