import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import compression from "compression";
import helmet from "helmet";
import routes from "./startup/routes";
import infoLogger from "./startup/logger";
import cors from "./startup/cors";
import errorMiddleware from "./middlewares/error";

dotenv.config();
const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(compression());
app.use(helmet());
app.use(express.static("public"));
app.set("view engine", "ejs");
cors(app);
routes(app);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  infoLogger.info(`Server started on port ${port}`);
});

export default server;
