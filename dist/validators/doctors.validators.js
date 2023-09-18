"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
exports.default = {
    create: function (doctor) {
        const schema = joi_1.default.object({
            first_name: joi_1.default.string().required(),
            last_name: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
            gender: joi_1.default.string().required(),
            password: joi_1.default.string().required(),
            specialization: joi_1.default.string().required(),
            hospital_clinic_name: joi_1.default.string().required(),
            address: joi_1.default.string().required(),
            city: joi_1.default.string().required(),
            state: joi_1.default.string().required(),
        });
        return schema.validate(doctor);
    },
    schedule: function (schedule) {
        const schema = joi_1.default.array()
            .items({
            day: joi_1.default.string().required(),
            startTime: joi_1.default.string().required(),
            endTime: joi_1.default.string().required(),
            is_active: joi_1.default.boolean().required(),
            break_start: joi_1.default.string(),
            break_end: joi_1.default.string(),
            appointment_interval: joi_1.default.number().required(),
            buffer: joi_1.default.number(),
        })
            .length(7)
            .required();
        return schema.validate(schedule);
    },
    charges: function (charges) {
        const schema = joi_1.default.array()
            .items({
            appointment_type: joi_1.default.string().required(),
            amount: joi_1.default.number().required(),
        })
            .required()
            .min(1);
        return schema.validate(charges);
    },
};
//# sourceMappingURL=doctors.validators.js.map