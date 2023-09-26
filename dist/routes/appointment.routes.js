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
router.get("/doctor", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.getDoctorAppointments));
router.get("/patient", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.getPatientAppointments));
router.put("/:id", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.updatePaymentStatus));
router.post("/cancel", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.cancelAppointment));
router.get("/completed", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.getCompletedAppointments));
router.get("/requests", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.getAppointmentRequests));
router.post("/requests/accept", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.acceptAppointmentRequest));
router.post("/requests/reject", (0, auth_1.default)(), (0, trycatch_1.default)(appointments_controller_1.default.rejectAppointmentRequest));
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map