"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_routes_1 = __importDefault(require("../routes/index.routes"));
const patients_routes_1 = __importDefault(require("../routes/patients.routes"));
const doctors_routes_1 = __importDefault(require("../routes/doctors.routes"));
const auth_routes_1 = __importDefault(require("../routes/auth.routes"));
const appointment_routes_1 = __importDefault(require("../routes/appointment.routes"));
const transactions_routes_1 = __importDefault(require("../routes/transactions.routes"));
const prescription_routes_1 = __importDefault(require("../routes/prescription.routes"));
const messages_routes_1 = __importDefault(require("../routes/messages.routes"));
const calls_routes_1 = __importDefault(require("../routes/calls.routes"));
function default_1(app) {
    app.use("/api/", index_routes_1.default);
    app.use("/api/patients", patients_routes_1.default);
    app.use("/api/doctors", doctors_routes_1.default);
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/appointments", appointment_routes_1.default);
    app.use("/api/transactions", transactions_routes_1.default);
    app.use("/api/prescription", prescription_routes_1.default);
    app.use("/api/messages", messages_routes_1.default);
    app.use("/api/calls", calls_routes_1.default);
}
exports.default = default_1;
//# sourceMappingURL=routes.js.map