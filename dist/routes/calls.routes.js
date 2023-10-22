"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const calls_controller_1 = __importDefault(require("../controllers/calls.controller"));
const router = express_1.default.Router();
router.post("/:userId", (0, auth_1.default)(), (0, trycatch_1.default)(calls_controller_1.default.createCall));
exports.default = router;
//# sourceMappingURL=calls.routes.js.map