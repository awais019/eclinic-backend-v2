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
const helpers_1 = __importDefault(require("../helpers"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const stripe_1 = __importDefault(require("../helpers/stripe"));
const constants_1 = __importDefault(require("../constants"));
const prisma_1 = __importDefault(require("../prisma"));
const client_1 = require("@prisma/client");
exports.default = {
    create: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, patient_name, date, time, appointment_type, message } = req.body;
            const token = req.header(constants_1.default.AUTH_HEADER_NAME);
            const { _id } = jwt_1.default.decode(token);
            const patient = yield prisma_1.default.patient.findUnique({
                where: {
                    userId: _id,
                },
            });
            if (!patient) {
                helpers_1.default.sendAPIError(res, new Error(constants_1.default.NOT_FOUND_MSG), constants_1.default.NOT_FOUND_CODE);
            }
            const appointmentExists = yield prisma_1.default.appointment.findFirst({
                where: {
                    doctorId,
                    date,
                    time,
                },
            });
            if (appointmentExists) {
                helpers_1.default.sendAPIError(res, new Error(constants_1.default.DOCTOR_NOT_AVAILABLE), constants_1.default.BAD_REQUEST_CODE);
            }
            const charges = yield prisma_1.default.charges.findFirst({
                where: {
                    doctorId,
                    appointment_type,
                },
                select: {
                    amount: true,
                },
            });
            if (!charges) {
                helpers_1.default.sendAPIError(res, new Error(constants_1.default.NOT_FOUND_MSG), constants_1.default.NOT_FOUND_CODE);
            }
            const doctor = yield prisma_1.default.doctor.findUnique({
                where: {
                    id: doctorId,
                },
                select: {
                    user: {
                        select: {
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
            });
            const appointment = yield prisma_1.default.appointment.create({
                data: {
                    doctorId,
                    patientId: patient.id,
                    patient_name,
                    date,
                    time,
                    type: appointment_type,
                    message,
                    charges: charges.amount,
                },
            });
            yield prisma_1.default.transactions.create({
                data: {
                    appointment_id: appointment.id,
                    doctor_id: doctorId,
                    patient_id: patient.id,
                    amount: charges.amount,
                    status: client_1.PAYMENT_STATUS.PAID,
                },
            });
            const price = yield stripe_1.default.createAppointment(`${doctor.user.first_name} ${doctor.user.last_name}`, patient_name, appointment.id, charges.amount);
            const session = yield stripe_1.default.createPaymentLink(price);
            helpers_1.default.sendAPISuccess(res, { paymentLink: session.url }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
        });
    },
    getDoctorAppointments: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { date } = req.query;
        const _date = new Date(date);
        _date.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        if (!doctor) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                doctorId: doctor.id,
                date: date
                    ? _date
                    : {
                        gte: today,
                    },
                completed: false,
                status: client_1.APPOINTMENT_STATUS.ACCEPTED,
                payment_status: client_1.PAYMENT_STATUS.PAID,
            },
            select: {
                id: true,
                patient_name: true,
                date: true,
                time: true,
                type: true,
                charges: true,
                message: true,
                completed: true,
                Patient: {
                    select: {
                        user: {
                            select: {
                                image: true,
                            },
                        },
                    },
                },
            },
        });
        const _appointments = appointments.map((appointment) => (Object.assign(Object.assign({}, appointment), { image: appointment.Patient.user.image })));
        _appointments.forEach((appointment) => {
            delete appointment.Patient;
        });
        helpers_1.default.sendAPISuccess(res, _appointments, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getPatientAppointments: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { date } = req.query;
        const _date = new Date(date);
        _date.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const patient = yield prisma_1.default.patient.findUnique({
            where: {
                userId: _id,
            },
        });
        if (!patient) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                patientId: patient.id,
                date: date
                    ? _date
                    : {
                        gt: today,
                    },
                completed: false,
                status: client_1.APPOINTMENT_STATUS.ACCEPTED,
                payment_status: client_1.PAYMENT_STATUS.PAID,
            },
            select: {
                id: true,
                patient_name: true,
                date: true,
                time: true,
                type: true,
                charges: true,
                message: true,
                completed: true,
                Doctor: {
                    select: {
                        specialization: true,
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
        });
        const _appointments = appointments.map((appointment) => (Object.assign(Object.assign({}, appointment), { doctor: {
                first_name: appointment.Doctor.user.first_name,
                last_name: appointment.Doctor.user.last_name,
                specialization: appointment.Doctor.specialization,
            }, image: appointment.Doctor.user.image })));
        _appointments.forEach((appointment) => {
            delete appointment.Doctor;
        });
        helpers_1.default.sendAPISuccess(res, _appointments, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    cancelAppointment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.BAD_REQUEST_MSG), constants_1.default.BAD_REQUEST_CODE);
        }
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        yield prisma_1.default.appointment.update({
            where: {
                id: appointmentId,
                date: {
                    gt: date,
                },
            },
            data: {
                status: client_1.APPOINTMENT_STATUS.CANCELLED,
            },
        });
        helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    updatePaymentStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        const appointment = yield prisma_1.default.appointment.update({
            where: {
                id,
                payment_status: client_1.PAYMENT_STATUS.PENDING,
            },
            data: { payment_status: client_1.PAYMENT_STATUS.PAID },
            select: {
                date: true,
                time: true,
                type: true,
                Doctor: {
                    select: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!appointment) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.NOT_FOUND_MSG), constants_1.default.NOT_FOUND_CODE);
        }
        helpers_1.default.sendAPISuccess(res, {
            date: appointment.date,
            time: appointment.time,
            type: appointment.type,
            doctor: `${appointment.Doctor.user.first_name} ${appointment.Doctor.user.last_name}`,
        }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getCompletedAppointments: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        if (!doctor) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                doctorId: doctor.id,
                completed: true,
            },
            select: {
                patient_name: true,
                date: true,
                time: true,
                type: true,
                charges: true,
                completed: true,
                Patient: {
                    select: {
                        user: {
                            select: {
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "asc",
            },
        });
        const _appointments = appointments.map((appointment) => (Object.assign(Object.assign({}, appointment), { image: appointment.Patient.user.image })));
        _appointments.forEach((appointment) => {
            delete appointment.Patient;
        });
        helpers_1.default.sendAPISuccess(res, _appointments, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getAppointmentRequests: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        if (!doctor) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                doctorId: doctor.id,
                status: client_1.APPOINTMENT_STATUS.PENDING,
            },
            select: {
                id: true,
                patient_name: true,
                date: true,
                time: true,
                type: true,
                charges: true,
                message: true,
                Patient: {
                    select: {
                        user: {
                            select: {
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "asc",
            },
        });
        const _appointments = appointments.map((appointment) => (Object.assign(Object.assign({}, appointment), { image: appointment.Patient.user.image })));
        _appointments.forEach((appointment) => {
            delete appointment.Patient;
        });
        helpers_1.default.sendAPISuccess(res, _appointments, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    acceptAppointmentRequest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.BAD_REQUEST_MSG), constants_1.default.BAD_REQUEST_CODE);
        }
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        yield prisma_1.default.appointment.update({
            where: {
                id: appointmentId,
                date: {
                    gt: date,
                },
            },
            data: {
                status: client_1.APPOINTMENT_STATUS.ACCEPTED,
            },
        });
        helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    rejectAppointmentRequest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            helpers_1.default.sendAPIError(res, new Error(constants_1.default.BAD_REQUEST_MSG), constants_1.default.BAD_REQUEST_CODE);
        }
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        yield prisma_1.default.appointment.update({
            where: {
                id: appointmentId,
                date: {
                    gt: date,
                },
            },
            data: {
                status: client_1.APPOINTMENT_STATUS.REJECTED,
            },
        });
        helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
};
//# sourceMappingURL=appointments.controller.js.map