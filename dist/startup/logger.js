"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { File, Console } = winston_1.transports;
const logger = (0, winston_1.createLogger)({
    format: winston_1.format.json(),
    transports: [
        new File({ filename: "logs/error.log", level: "error" }),
        new File({
            filename: "logs/combined.log",
            handleExceptions: true,
            handleRejections: true,
        }),
    ],
});
if (process.env.NODE_ENV !== "production") {
    logger.add(new Console({
        format: winston_1.format.simple(),
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map