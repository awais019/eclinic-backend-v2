import express from "express";
import dotenv from "dotenv";
import infoLogger from "./startup/logger";

dotenv.config();
const app = express();

const port = process.env.PORT || 3000;

throw new Error("Something failed during startup.");

app.listen(port, () => {
  infoLogger.info(`Server started on port ${port}`);
});
