"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const lab_controller_1 = __importDefault(require("../controllers/lab.controller"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = express_1.default.Router();
router.post("/", (0, trycatch_1.default)(lab_controller_1.default.register));
router.get("/tests", (0, auth_1.default)(), (0, trycatch_1.default)(lab_controller_1.default.getTests));
router.post("/signin", (0, trycatch_1.default)(lab_controller_1.default.signIn));
router.get("/", (0, auth_1.default)(), (0, trycatch_1.default)(lab_controller_1.default.getLabs));
router.post("/test", (0, auth_1.default)(), (0, trycatch_1.default)(lab_controller_1.default.requestTest));
router.post("/report/:testId", (0, auth_1.default)(), (0, trycatch_1.default)(lab_controller_1.default.uploadReport));
exports.default = router;
//# sourceMappingURL=lab.routes.js.map