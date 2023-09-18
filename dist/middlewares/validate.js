"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../helpers"));
function default_1(validator) {
    return function (req, res, next) {
        const { error } = validator(req.body);
        if (error)
            return helpers_1.default.sendAPIError(res, new Error(error.details[0].message));
        next();
    };
}
exports.default = default_1;
//# sourceMappingURL=validate.js.map