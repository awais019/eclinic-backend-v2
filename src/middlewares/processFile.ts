import util from "util";
import Multer from "multer";
import constants from "../constants";

const processFile = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: constants.MAX_FILE_SIZE },
}).single("file");

const processFileMiddleware = util.promisify(processFile);

export default processFileMiddleware;
