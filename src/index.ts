import express from "express";
import dotenv from "dotenv";
import routes from "./startup/routes";
import infoLogger from "./startup/logger";
import errorMiddleware from "./middlewares/error";

dotenv.config();
const app = express();

routes(app);

app.use(express.json());
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  infoLogger.info(`Server started on port ${port}`);
});

export default server;
