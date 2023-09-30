"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const transactions_controller_1 = __importDefault(require("../controllers/transactions.controller"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const router = express_1.default.Router();
router.get("/doctor", (0, auth_1.default)(), (0, trycatch_1.default)(transactions_controller_1.default.getDoctorTransactions));
router.get("/patient", (0, auth_1.default)(), (0, trycatch_1.default)(transactions_controller_1.default.getPatientTransactions));
exports.default = router;
//# sourceMappingURL=transactions.routes.js.map