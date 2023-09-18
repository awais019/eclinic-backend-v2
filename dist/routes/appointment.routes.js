"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const appointments_controller_1 = __importDefault(require("../controllers/appointments.controller"));
const router = express_1.default.Router();
router.post("/create", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.create));
router.get("/", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.getAppointments));
router.get("/completed", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.getCompletedAppointments));
router.get("/requests", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.getAppointmentRequests));
router.post("/requests/accept", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.acceptAppointmentRequest));
router.post("/requests/reject", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.rejectAppointmentRequest));
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map