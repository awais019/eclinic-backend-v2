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
const client_1 = require("@prisma/client");
const helpers_1 = __importDefault(require("../helpers"));
const upload_1 = __importDefault(require("../helpers/upload"));
const crypto_1 = __importDefault(require("../helpers/crypto"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const email_1 = __importDefault(require("../helpers/email"));
const ejs_1 = __importDefault(require("../helpers/ejs"));
const date_1 = __importDefault(require("../helpers/date"));
exports.default = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.files && process.env.NODE_ENV !== "test") {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.FILE_NOT_UPLOADED), constants_1.default.BAD_REQUEST_CODE);
        }
        let { first_name, last_name, email, gender, password, specialization, hospital_clinic_name, address, city, state, } = req.body;
        const userExists = yield prisma_1.default.user.findUnique({
            where: {
                email,
            },
        });
        if (userExists) {
            return helpers_1.default.sendAPIError(res, new Error("Account already exists with this email."), constants_1.default.BAD_REQUEST_CODE);
        }
        gender = gender.toUpperCase();
        password = crypto_1.default.encryptPassword(password);
        const user = {
            first_name,
            last_name,
            email,
            gender,
            password,
            role: client_1.ROLE.DOCTOR,
        };
        const location = {
            address,
            city,
            state,
        };
        let fileName = "";
        if (process.env.NODE_ENV === "production" ||
            process.env.NODE_ENV === "development") {
            const file = Object.values(req.files)[0];
            if (file.size > constants_1.default.MAX_FILE_SIZE) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.FILE_TOO_LARGE), constants_1.default.BAD_REQUEST_CODE);
            }
            fileName = yield upload_1.default.uploadFile(file, constants_1.default.DOCUMENT_FOLDER);
        }
        yield prisma_1.default.$transaction(() => __awaiter(void 0, void 0, void 0, function* () {
            const doctor = yield prisma_1.default.doctor.create({
                data: {
                    specialization,
                    hospital_clinic_name,
                    user: {
                        create: user,
                    },
                    location: {
                        create: location,
                    },
                },
            });
            yield prisma_1.default.document.create({
                data: {
                    name: fileName,
                    doctorId: doctor.id,
                },
            });
            if (process.env.NODE_ENV != "test") {
                const token = jwt_1.default.sign({ _id: doctor.userId, email });
                const html = yield ejs_1.default.renderHTMLFile("email", {
                    name: first_name,
                    link: `${process.env.CLIENT_URL}/?token=${token}`,
                });
                yield email_1.default.sendMail(email, "Welcome to Eclinic", null, null, html);
            }
        }));
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.CREATED_CODE, constants_1.default.SUCCESS_MSG);
    }),
    setSchedule: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        let schedule = req.body;
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        schedule = schedule.map((s) => {
            return Object.assign(Object.assign({}, s), { day: s.day.toUpperCase(), doctorId: doctor.id });
        });
        if (!doctor) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        try {
            yield prisma_1.default.schedule.createMany({
                data: schedule,
            });
        }
        catch (error) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INTERNAL_SERVER_ERROR_MSG), constants_1.default.INTERNAL_SERVER_ERROR_CODE);
        }
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.CREATED_CODE, constants_1.default.SUCCESS_MSG);
    }),
    updateSchedule: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        let schedule = req.body;
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        schedule = schedule.map((s) => {
            return Object.assign(Object.assign({}, s), { day: s.day.toUpperCase(), doctorId: doctor.id });
        });
        if (!doctor) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        try {
            yield prisma_1.default.schedule.deleteMany({
                where: {
                    doctorId: doctor.id,
                },
            });
            yield prisma_1.default.schedule.createMany({
                data: schedule,
            });
        }
        catch (error) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INTERNAL_SERVER_ERROR_MSG), constants_1.default.INTERNAL_SERVER_ERROR_CODE);
        }
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    setCharges: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        let charges = req.body;
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        charges = charges.map((c) => {
            return Object.assign(Object.assign({}, c), { doctorId: doctor.id });
        });
        if (!doctor) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        if (charges.length == 2) {
            yield prisma_1.default.doctor.update({
                where: {
                    id: doctor.id,
                },
                data: {
                    appointment_types_allowed: ["PHYSICAL", "VIRTUAL"],
                },
            });
        }
        try {
            yield prisma_1.default.charges.createMany({
                data: charges,
            });
        }
        catch (error) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INTERNAL_SERVER_ERROR_MSG), constants_1.default.INTERNAL_SERVER_ERROR_CODE);
        }
        yield prisma_1.default.user.update({
            where: {
                id: doctor.userId,
            },
            data: {
                profile_setup: true,
            },
        });
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.CREATED_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getCharges: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const charges = yield prisma_1.default.charges.findMany({
            where: {
                doctorId: doctor.id,
            },
            select: {
                appointment_type: true,
                amount: true,
            },
        });
        return helpers_1.default.sendAPISuccess(res, charges, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    updateCharges: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        let charges = req.body;
        const { _id } = jwt_1.default.decode(token);
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                userId: _id,
            },
        });
        charges = charges.map((c) => {
            return Object.assign(Object.assign({}, c), { doctorId: doctor.id });
        });
        if (!doctor) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.UNAUTHORIZED_MSG), constants_1.default.UNAUTHORIZED_CODE);
        }
        if (charges.length == 2) {
            yield prisma_1.default.doctor.update({
                where: {
                    id: doctor.id,
                },
                data: {
                    appointment_types_allowed: ["PHYSICAL", "VIRTUAL"],
                },
            });
        }
        else {
            yield prisma_1.default.doctor.update({
                where: {
                    id: doctor.id,
                },
                data: {
                    appointment_types_allowed: ["PHYSICAL"],
                },
            });
        }
        try {
            yield prisma_1.default.charges.deleteMany({
                where: {
                    doctorId: doctor.id,
                },
            });
            yield prisma_1.default.charges.createMany({
                data: charges,
            });
        }
        catch (error) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INTERNAL_SERVER_ERROR_MSG), constants_1.default.INTERNAL_SERVER_ERROR_CODE);
        }
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getDoctors: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let page = 0;
        let totalPages = 0;
        if (req.query.page) {
            page = parseInt(req.query.page);
        }
        let q = "";
        let specialization = "";
        if (req.query.q) {
            q = req.query.q;
        }
        if (req.query.specialization) {
            specialization = req.query.specialization;
        }
        const skip = page * constants_1.default.PAGE_SIZE;
        const doctors = yield prisma_1.default.$transaction(() => __awaiter(void 0, void 0, void 0, function* () {
            let doctors = yield prisma_1.default.doctor.findMany({
                where: {
                    specialization: {
                        contains: specialization,
                        mode: "insensitive",
                    },
                    verification: client_1.VERIFICATION_STATUS.VERIFIED,
                    OR: [
                        {
                            user: {
                                first_name: {
                                    contains: q,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            user: {
                                last_name: {
                                    contains: q,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            location: {
                                city: {
                                    contains: q,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            location: {
                                state: {
                                    contains: q,
                                    mode: "insensitive",
                                },
                            },
                        },
                    ],
                },
            });
            totalPages = Math.ceil(doctors.length / constants_1.default.PAGE_SIZE);
            if (page >= totalPages) {
                return [];
            }
            doctors = doctors.slice(skip, skip + constants_1.default.PAGE_SIZE);
            if (page === totalPages) {
                doctors = doctors.slice(skip);
            }
            const user = yield prisma_1.default.user.findMany({
                where: {
                    id: {
                        in: doctors.map((d) => d.userId),
                    },
                },
            });
            const location = yield prisma_1.default.location.findMany({
                where: {
                    id: {
                        in: doctors.map((d) => d.locationId),
                    },
                },
            });
            const workingHours = yield prisma_1.default.schedule.findFirst({
                where: {
                    doctorId: {
                        in: doctors.map((d) => d.id),
                    },
                },
            });
            const charges = yield prisma_1.default.charges.findMany({
                where: {
                    doctorId: {
                        in: doctors.map((d) => d.id),
                    },
                },
            });
            const reviewsCount = yield prisma_1.default.reviews.count({
                where: {
                    doctorId: {
                        in: doctors.map((d) => d.id),
                    },
                },
            });
            const rating = yield prisma_1.default.reviews.aggregate({
                where: {
                    doctorId: {
                        in: doctors.map((d) => d.id),
                    },
                },
                _avg: {
                    rating: true,
                },
            });
            return [
                ...doctors.map((d) => {
                    return Object.assign(Object.assign({}, d), { first_name: user.find((u) => u.id === d.userId).first_name, last_name: user.find((u) => u.id === d.userId).last_name, image: user.find((u) => u.id === d.userId).image, address: location.find((l) => l.id === d.locationId).address, city: location.find((l) => l.id === d.locationId).city, state: location.find((l) => l.id === d.locationId).state, workingHours: {
                            startTime: workingHours.startTime,
                            endTime: workingHours.endTime,
                        }, charges: {
                            physical: charges.find((c) => c.appointment_type.toUpperCase() === "PHYSICAL").amount,
                            virtual: charges.find((c) => c.appointment_type.toUpperCase() === "VIRTUAL")
                                ? charges.find((c) => c.appointment_type === "VIRTUAL").amount
                                : null,
                        }, reviewsCount, rating: rating._avg.rating });
                }),
            ];
        }));
        return helpers_1.default.sendAPISuccess(res, {
            page,
            pageSize: constants_1.default.PAGE_SIZE,
            totalPages,
            doctors,
        }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getSpecializations: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const s = yield prisma_1.default.doctor.findMany({
            select: {
                specialization: true,
            },
            distinct: ["specialization"],
        });
        const specializations = s.map((s) => s.specialization);
        return helpers_1.default.sendAPISuccess(res, {
            specializations,
        }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getDoctor: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorId = req.params.id;
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: {
                id: doctorId,
            },
        });
        if (!doctor) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.NOT_FOUND_MSG), constants_1.default.NOT_FOUND_CODE);
        }
        const user = yield prisma_1.default.user.findUnique({
            where: {
                id: doctor.userId,
            },
        });
        const location = yield prisma_1.default.location.findUnique({
            where: {
                id: doctor.locationId,
            },
        });
        const workingHours = yield prisma_1.default.schedule.findFirst({
            where: {
                doctorId,
            },
        });
        const charges = yield prisma_1.default.charges.findMany({
            where: {
                doctorId,
            },
        });
        const reviewsCount = yield prisma_1.default.reviews.count({
            where: {
                doctorId,
            },
        });
        const rating = yield prisma_1.default.reviews.aggregate({
            where: {
                doctorId,
            },
            _avg: {
                rating: true,
            },
        });
        return helpers_1.default.sendAPISuccess(res, {
            first_name: user.first_name,
            last_name: user.last_name,
            specialization: doctor.specialization,
            about: doctor.about,
            image: user.image,
            hospital_clinic_name: doctor.hospital_clinic_name,
            address: location.address,
            city: location.city,
            state: location.state,
            workingHours: {
                startTime: workingHours.startTime,
                endTime: workingHours.endTime,
            },
            charges: {
                physical: charges.find((c) => c.appointment_type.toUpperCase() === "PHYSICAL").amount,
                virtual: charges.find((c) => c.appointment_type === "VIRTUAL")
                    ? charges.find((c) => c.appointment_type.toUpperCase() === "VIRTUAL").amount
                    : null,
            },
            appointment_types_allowed: doctor.appointment_types_allowed,
            reviewsCount,
            rating: Math.round(rating._avg.rating),
        }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getReviews: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let doctorId;
        if (req.params.id != "undefined") {
            doctorId = req.params.id;
        }
        else if (req.params.id == "undefined") {
            const token = req.header(constants_1.default.AUTH_HEADER_NAME);
            const { _id } = jwt_1.default.decode(token);
            const doctor = yield prisma_1.default.doctor.findUnique({
                where: {
                    userId: _id,
                },
            });
            doctorId = doctor.id;
        }
        const reviews = yield prisma_1.default.reviews.findMany({
            where: {
                doctorId,
            },
            select: {
                id: true,
                rating: true,
                review: true,
                date: true,
                patientId: true,
            },
            orderBy: {
                date: "desc",
            },
        });
        const patients = yield prisma_1.default.patient.findMany({
            where: {
                id: {
                    in: reviews.map((r) => r.patientId),
                },
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        image: true,
                    },
                },
            },
        });
        const data = reviews.map((r) => {
            return {
                id: r.id,
                rating: r.rating,
                review: r.review,
                date: r.date,
                user: {
                    firstName: patients.find((p) => p.id === r.patientId).user.first_name,
                    lastName: patients.find((p) => p.id === r.patientId).user.last_name,
                    image: patients.find((p) => p.id === r.patientId).user.image,
                },
            };
        });
        return helpers_1.default.sendAPISuccess(res, data, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getSchedule: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorId = req.params.id;
        const nextTwoWeeks = date_1.default.getNextTwoWeeks();
        const schedule = yield prisma_1.default.schedule.findMany({
            where: {
                doctorId,
            },
        });
        nextTwoWeeks.forEach((day) => {
            const s = schedule.find((s) => s.day.toLowerCase() === day.day.toLowerCase());
            if (!s || !s.is_active) {
                day.disable = true;
            }
        });
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                doctorId,
                date: {
                    in: nextTwoWeeks.map((d) => d.date),
                },
            },
        });
        nextTwoWeeks.forEach((day) => {
            const a = appointments.filter((a) => a.date === day.date);
            if (a.length >= 10) {
                day.disable = true;
            }
        });
        return helpers_1.default.sendAPISuccess(res, nextTwoWeeks, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getTimeSlots: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { date, day } = req.body;
        const doctorId = req.params.id;
        const schedule = yield prisma_1.default.schedule.findFirst({
            where: {
                doctorId,
                day: day.toUpperCase(),
            },
        });
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                doctorId,
                date,
            },
        });
        const timeSlots = date_1.default.getTimeSlots(schedule.startTime, schedule.endTime, schedule.break_start, schedule.break_end, schedule.appointment_interval);
        timeSlots.forEach((slot) => {
            const a = appointments.find((a) => a.time === slot.start);
            if (a) {
                slot.disable = true;
            }
        });
        return res.send(timeSlots);
    }),
    getFullSchedule: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const schedule = yield prisma_1.default.schedule.findMany({
            where: {
                doctorId: doctor.id,
            },
            select: {
                is_active: true,
                day: true,
                startTime: true,
                endTime: true,
                break_start: true,
                break_end: true,
                appointment_interval: true,
            },
        });
        return helpers_1.default.sendAPISuccess(res, schedule, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
};
//# sourceMappingURL=doctors.controller.js.map