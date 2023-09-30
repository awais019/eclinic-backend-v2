"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const prescription_controller_1 = __importDefault(require("../controllers/prescription.controller"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(), (0, trycatch_1.default)(prescription_controller_1.default.create));
router.get("/", (0, auth_1.default)(), (0, trycatch_1.default)(prescription_controller_1.default.get));
exports.default = router;
//# sourceMappingURL=prescription.routes.js.map