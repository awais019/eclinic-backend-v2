"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("../constants"));
const prisma_1 = __importDefault(require("../prisma"));
const helpers_1 = __importDefault(require("../helpers"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
exports.default = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        if (!doctor) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        const { prescription, appointmentId } = req.body;
        if (!appointmentId || !prescription) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.BAD_REQUEST_MSG), constants_1.default.BAD_REQUEST_CODE);
        }
        yield prisma_1.default.$transaction(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma_1.default.prescription.create({
                data: {
                    appointmentId,
                    Medication: {
                        createMany: {
                            data: prescription,
                        },
                    },
                },
            });
            yield prisma_1.default.appointment.update({
                where: {
                    id: appointmentId,
                },
                data: {
                    completed: true,
                },
            });
        }));
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.patient.findUnique({
            where: {
                userId: _id,
            },
        });
        if (!doctor) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                patientId: doctor.id,
                completed: true,
            },
            select: {
                id: true,
            },
        });
        const prescriptions = yield prisma_1.default.prescription.findMany({
            where: {
                appointmentId: {
                    in: appointments.map((appointment) => appointment.id),
                },
            },
            orderBy: {
                Appointment: {
                    date: "desc",
                },
            },
            select: {
                id: true,
                Appointment: {
                    select: {
                        type: true,
                        date: true,
                        Doctor: {
                            select: {
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                    },
                },
                Medication: {
                    select: {
                        medication: true,
                        dosage: true,
                        instructions: true,
                    },
                },
            },
        });
        return helpers_1.default.sendAPISuccess(res, prescriptions.map((prescription) => {
            return {
                id: prescription.id,
                appointment: {
                    date: prescription.Appointment.date,
                    type: prescription.Appointment.type,
                },
                doctor: {
                    first_name: prescription.Appointment.Doctor.user.first_name,
                    last_name: prescription.Appointment.Doctor.user.last_name,
                    image: prescription.Appointment.Doctor.user.image,
                },
                medication: prescription.Medication,
            };
        }), constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
};
//# sourceMappingURL=prescription.controller.js.map