"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = __importDefault(require("crypto-js"));
exports.default = {
    encryptPassword: (password) => {
        return crypto_js_1.default.AES.encrypt(password, process.env.ENCRYPTION_SECRET).toString();
    },
    decryptPassword: (hashedPassword) => {
        return crypto_js_1.default.AES.decrypt(hashedPassword, process.env.ENCRYPTION_SECRET).toString(crypto_js_1.default.enc.Utf8);
    },
    comparePassword: (password, hashedPassword) => {
        return (crypto_js_1.default.AES.decrypt(hashedPassword, process.env.ENCRYPTION_SECRET).toString(crypto_js_1.default.enc.Utf8) === password);
    },
};
//# sourceMappingURL=crypto.js.map