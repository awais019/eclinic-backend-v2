"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("../constants"));
const helpers_1 = __importDefault(require("../helpers"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
function default_1() {
    return function (req, res, next) {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        if (!token) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.AUTH_REQUIRED), constants_1.default.UNAUTHORIZED_CODE);
        }
        try {
            jwt_1.default.verify(token);
            next();
        }
        catch (error) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INVALID_TOKEN), constants_1.default.BAD_REQUEST_CODE);
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=auth.js.map