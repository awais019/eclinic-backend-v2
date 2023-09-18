"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
exports.default = {
    verifyEmail: function ({ token }) {
        const schema = joi_1.default.object({
            token: joi_1.default.required(),
        });
        return schema.validate({ token });
    },
    signin: function ({ email, password }) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
        });
        return schema.validate({ email, password });
    },
    forgotPassword: function ({ email }) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
        });
        return schema.validate({ email });
    },
    resetPassword: function ({ token, password, }) {
        const schema = joi_1.default.object({
            token: joi_1.default.string().required(),
            password: joi_1.default.string().required(),
        });
        return schema.validate({ token, password });
    },
    sendPhoneCode: function ({ phone }) {
        const schema = joi_1.default.object({
            phone: joi_1.default.string().required(),
        });
        return schema.validate({ phone });
    },
    verifyPhoneCode: function ({ phone, code }) {
        const schema = joi_1.default.object({
            phone: joi_1.default.string().required(),
            code: joi_1.default.string().required(),
        });
        return schema.validate({ phone, code });
    },
};
//# sourceMappingURL=auth.validators.js.map