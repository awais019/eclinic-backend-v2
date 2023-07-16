import express from "express";
import dotenv from "dotenv";
import infoLogger from "./startup/logger";
import errorMiddleware from "./middlewares/error";

dotenv.config();
const app = express();

app.use(express.json());
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  infoLogger.info(`Server started on port ${port}`);
});
