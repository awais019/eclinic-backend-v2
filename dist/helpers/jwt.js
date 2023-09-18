"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.default = {
    sign: (payload) => {
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE_TIME,
        });
    },
    verify: (token, options = null) => {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, options);
    },
    decode: (token) => {
        return jsonwebtoken_1.default.decode(token);
    },
};
//# sourceMappingURL=jwt.js.map