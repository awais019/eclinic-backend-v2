"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./startup/routes"));
const logger_1 = __importDefault(require("./startup/logger"));
const cors_1 = __importDefault(require("./startup/cors"));
const error_1 = __importDefault(require("./middlewares/error"));
const static_1 = __importDefault(require("./middlewares/static"));
const socket_1 = __importDefault(require("./startup/socket"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, express_fileupload_1.default)());
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)());
app.use("/images", [(0, static_1.default)()], express_1.default.static("public/uploads/images"));
app.use("/documents", [(0, static_1.default)()], express_1.default.static("public/uploads/documents"));
app.set("view engine", "ejs");
(0, cors_1.default)(app);
(0, routes_1.default)(app);
app.use(error_1.default);
const server = http_1.default.createServer(app);
const io = (0, socket_1.default)(server);
exports.io = io;
const port = process.env.PORT || 3000;
server.listen(port, () => {
    logger_1.default.info(`Server started on port ${port}`);
});
exports.default = server;
//# sourceMappingURL=index.js.map