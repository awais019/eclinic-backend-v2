"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
exports.default = {
    create: function (patient) {
        const schema = joi_1.default.object({
            first_name: joi_1.default.string().required(),
            last_name: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
            gender: joi_1.default.string().required(),
            birthdate: joi_1.default.date().required(),
            password: joi_1.default.string().required(),
        });
        return schema.validate(patient);
    },
    bookAppointment: function (appointment) {
        const schema = joi_1.default.object({
            doctorId: joi_1.default.string().required(),
            date: joi_1.default.date().required(),
            time: joi_1.default.string().required(),
            duration: joi_1.default.number().required(),
            charges: joi_1.default.number().required(),
            type: joi_1.default.string().required(),
        });
        return schema.validate(appointment);
    },
};
//# sourceMappingURL=patients.validator.js.map