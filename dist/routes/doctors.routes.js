"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctors_validators_1 = __importDefault(require("../validators/doctors.validators"));
const validate_1 = __importDefault(require("../middlewares/validate"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const doctors_controller_1 = __importDefault(require("../controllers/doctors.controller"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const router = express_1.default.Router();
router.post("/register", (0, validate_1.default)(doctors_validators_1.default.create), (0, trycatch_1.default)(doctors_controller_1.default.create));
router.get("/schedule", (0, auth_1.default)(), (0, trycatch_1.default)(doctors_controller_1.default.getFullSchedule));
router.post("/schedule", [(0, auth_1.default)(), (0, validate_1.default)(doctors_validators_1.default.schedule)], (0, trycatch_1.default)(doctors_controller_1.default.setSchedule));
router.put("/schedule", [(0, auth_1.default)(), (0, validate_1.default)(doctors_validators_1.default.schedule)], (0, trycatch_1.default)(doctors_controller_1.default.updateSchedule));
router.post("/charges", [(0, auth_1.default)(), (0, validate_1.default)(doctors_validators_1.default.charges)], (0, trycatch_1.default)(doctors_controller_1.default.setCharges));
router.get("/charges", (0, auth_1.default)(), (0, trycatch_1.default)(doctors_controller_1.default.getCharges));
router.put("/charges", [(0, auth_1.default)(), (0, validate_1.default)(doctors_validators_1.default.charges)], (0, trycatch_1.default)(doctors_controller_1.default.updateCharges));
router.get("/", (0, trycatch_1.default)(doctors_controller_1.default.getDoctors));
router.get("/specializations", (0, trycatch_1.default)(doctors_controller_1.default.getSpecializations));
router.get("/:id", (0, auth_1.default)(), (0, trycatch_1.default)(doctors_controller_1.default.getDoctor));
router.get("/:id/reviews", (0, auth_1.default)(), (0, trycatch_1.default)(doctors_controller_1.default.getReviews));
router.get("/:id/schedule", (0, auth_1.default)(), (0, trycatch_1.default)(doctors_controller_1.default.getSchedule));
router.post("/:id/timeSlots", (0, auth_1.default)(), (0, trycatch_1.default)(doctors_controller_1.default.getTimeSlots));
exports.default = router;
//# sourceMappingURL=doctors.routes.js.map