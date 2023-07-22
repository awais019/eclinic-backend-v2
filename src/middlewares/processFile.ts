import util from "util";
import Multer from "multer";

const processFile = Multer({
  storage: Multer.memoryStorage(),
}).single("file");

const processFileMiddleware = util.promisify(processFile);

export default processFileMiddleware;
