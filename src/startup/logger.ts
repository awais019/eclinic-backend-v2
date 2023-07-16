import { createLogger, format, transports } from "winston";
const { File, Console } = transports;

const logger = createLogger({
  format: format.json(),
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
  logger.add(
    new Console({
      format: format.simple(),
    })
  );
}

export default logger;
