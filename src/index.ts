import express from "express";
import http from "http";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import compression from "compression";
import helmet from "helmet";
import routes from "./startup/routes";
import infoLogger from "./startup/logger";
import cors from "./startup/cors";
import errorMiddleware from "./middlewares/error";
import _static from "./middlewares/static";
import socket from "./startup/socket";

dotenv.config();
const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(compression());
app.use(helmet());
app.use("/images", [_static()], express.static("public/uploads/images"));
app.use("/documents", [_static()], express.static("public/uploads/documents"));
app.set("view engine", "ejs");
cors(app);
routes(app);
app.use(errorMiddleware);

const server = http.createServer(app);
// const io = socket(server);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  infoLogger.info(`Server started on port ${port}`);
});

export default server;
// export { io };
