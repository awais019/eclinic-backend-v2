"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_validators_1 = __importDefault(require("../validators/auth.validators"));
const validate_1 = __importDefault(require("../middlewares/validate"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = express_1.default.Router();
router.post("/verifyEmail", (0, validate_1.default)(auth_validators_1.default.verifyEmail), (0, trycatch_1.default)(auth_controller_1.default.verifyEmail));
router.post("/resend/verifyEmail", (0, validate_1.default)(auth_validators_1.default.verifyEmail), (0, trycatch_1.default)(auth_controller_1.default.requestNewEmailVerification));
router.post("/sendUpdateEmail", (0, auth_1.default)(), (0, trycatch_1.default)(auth_controller_1.default.sendUpdateEmail));
router.post("/signin", (0, validate_1.default)(auth_validators_1.default.signin), (0, trycatch_1.default)(auth_controller_1.default.signin));
router.post("/forgotpassword", (0, validate_1.default)(auth_validators_1.default.forgotPassword), (0, trycatch_1.default)(auth_controller_1.default.forgotPassword));
router.post("/resetpassword", (0, validate_1.default)(auth_validators_1.default.resetPassword), (0, trycatch_1.default)(auth_controller_1.default.resetPassword));
router.post("/updatepassword", (0, auth_1.default)(), (0, trycatch_1.default)(auth_controller_1.default.updatePassword));
router.post("/uploadimage", (0, auth_1.default)(), (0, trycatch_1.default)(auth_controller_1.default.uploadImage));
router.get("/me", (0, auth_1.default)(), (0, trycatch_1.default)(auth_controller_1.default.me));
router.put("/me", (0, auth_1.default)(), (0, trycatch_1.default)(auth_controller_1.default.updateInfo));
router.post("/updatehospital", (0, auth_1.default)(), (0, trycatch_1.default)(auth_controller_1.default.updateHospitalInfo));
router.post("/send/phonecode", [(0, validate_1.default)(auth_validators_1.default.sendPhoneCode), (0, auth_1.default)()], (0, trycatch_1.default)(auth_controller_1.default.sendPhoneCode));
router.post("/verify/phonecode", [(0, validate_1.default)(auth_validators_1.default.verifyPhoneCode), (0, auth_1.default)()], (0, trycatch_1.default)(auth_controller_1.default.verifyPhoneCode));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map