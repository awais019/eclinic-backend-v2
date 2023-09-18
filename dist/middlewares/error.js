"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("../constants"));
const helpers_1 = __importDefault(require("../helpers"));
const logger_1 = __importDefault(require("../startup/logger"));
function default_1(err, req, res, next) {
    logger_1.default.error(err.message, err);
    return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INTERNAL_SERVER_ERROR_MSG), constants_1.default.INTERNAL_SERVER_ERROR_CODE);
}
exports.default = default_1;
//# sourceMappingURL=error.js.map