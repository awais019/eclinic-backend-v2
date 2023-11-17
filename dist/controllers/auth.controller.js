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
const prisma_1 = __importDefault(require("../prisma"));
const constants_1 = __importDefault(require("../constants"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const crypto_1 = __importDefault(require("../helpers/crypto"));
const helpers_1 = __importDefault(require("../helpers"));
const ejs_1 = __importDefault(require("../helpers/ejs"));
const email_1 = __importDefault(require("../helpers/email"));
const upload_1 = __importDefault(require("../helpers/upload"));
const twilio_1 = __importDefault(require("../helpers/twilio"));
const client_1 = require("@prisma/client");
exports.default = {
    verifyEmail: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            try {
                jwt_1.default.verify(token);
            }
            catch (error) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INVALID_TOKEN), constants_1.default.BAD_REQUEST_CODE);
            }
            const { _id, email } = jwt_1.default.decode(token);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: _id },
            });
            if (!user) {
                const lab = prisma_1.default.lab.findUnique({
                    where: { id: _id },
                });
                if (lab) {
                    yield prisma_1.default.lab.update({
                        where: { id: _id },
                        data: {
                            email,
                            email_verified: true,
                        },
                    });
                }
                return helpers_1.default.sendAPISuccess(res, email, constants_1.default.SUCCESS_CODE, constants_1.default.EMAIL_VERIFIED);
            }
            if (email) {
                yield prisma_1.default.user.update({
                    where: { id: _id },
                    data: { email, email_verified: true },
                });
                return helpers_1.default.sendAPISuccess(res, email, constants_1.default.SUCCESS_CODE, constants_1.default.EMAIL_VERIFIED);
            }
            if (user.email_verified) {
                return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.EMAIL_ALREADY_VERIFIED);
            }
            yield prisma_1.default.user.update({
                where: { id: _id },
                data: { email_verified: true },
            });
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.EMAIL_VERIFIED);
        });
    },
    requestNewEmailVerification: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            try {
                jwt_1.default.verify(token, {
                    ignoreExpiration: true,
                });
            }
            catch (error) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INVALID_TOKEN), constants_1.default.BAD_REQUEST_CODE);
            }
            const { _id } = jwt_1.default.decode(token);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: _id },
            });
            if (user.email_verified) {
                return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.EMAIL_ALREADY_VERIFIED);
            }
            const newToken = jwt_1.default.sign({ _id, email: user.email });
            const html = yield ejs_1.default.renderHTMLFile("email", {
                name: user.first_name,
                link: `${process.env.CLIENT_URL}/?token=${newToken}`,
            });
            yield email_1.default.sendMail(user.email, "Welcome to Eclinic", null, null, html);
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.VERIFICATION_EMAIL_SENT);
        });
    },
    sendUpdateEmail: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const token = req.header(constants_1.default.AUTH_HEADER_NAME);
            const { _id } = jwt_1.default.decode(token);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: _id },
            });
            if (user.email == email) {
                return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.EMAIL_ALREADY_VERIFIED);
            }
            const newToken = jwt_1.default.sign({ _id, email });
            const html = yield ejs_1.default.renderHTMLFile("email", {
                name: user.first_name,
                link: `${process.env.CLIENT_URL}/?token=${newToken}`,
            });
            yield email_1.default.sendMail(email, "Welcome to Eclinic", null, null, html);
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.VERIFICATION_EMAIL_SENT);
        });
    },
    signin: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield prisma_1.default.user.findUnique({ where: { email } });
            if (!user) {
                return helpers_1.default.sendAPIError(res, new Error("Invalid credentials."), constants_1.default.UNAUTHORIZED_CODE);
            }
            let isPasswordValid;
            if (process.env.NODE_ENV === "test") {
                isPasswordValid = password === user.password;
            }
            else {
                isPasswordValid = crypto_1.default.comparePassword(password, user.password);
            }
            if (!isPasswordValid) {
                return helpers_1.default.sendAPIError(res, new Error("Invalid credentials."), constants_1.default.UNAUTHORIZED_CODE);
            }
            if (!user.email_verified) {
                return helpers_1.default.sendAPIError(res, new Error("Email not verified."), constants_1.default.FORBIDDEN_CODE);
            }
            if (user.role == client_1.ROLE.DOCTOR) {
                const doctor = yield prisma_1.default.doctor.findUnique({
                    where: { userId: user.id },
                });
                if (doctor.verification == client_1.VERIFICATION_STATUS.PENDING ||
                    doctor.verification == client_1.VERIFICATION_STATUS.REJECTED) {
                    return helpers_1.default.sendAPIError(res, new Error(constants_1.default.ACCOUNT_NOT_APPROVED), constants_1.default.FORBIDDEN_CODE);
                }
            }
            const token = jwt_1.default.sign({ _id: user.id, email: user.email });
            return helpers_1.default.sendAPISuccess(res, { token }, constants_1.default.SUCCESS_CODE, constants_1.default.LOGIN_SUCCESS);
        });
    },
    forgotPassword: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const user = yield prisma_1.default.user.findUnique({ where: { email } });
            if (!user) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.USER_NOT_FOUND), constants_1.default.NOT_FOUND_CODE);
            }
            const token = jwt_1.default.sign({ _id: user.id, email: user.email });
            const html = yield ejs_1.default.renderHTMLFile("resetpassword", {
                name: user.first_name,
                link: `${process.env.CLIENT_URL}/forgotpassword/resetpassword?token=${token}`,
            });
            yield email_1.default.sendMail(user.email, "Reset password", null, null, html);
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.RESET_PASSWORD_EMAIL_SENT);
        });
    },
    resetPassword: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, password } = req.body;
            try {
                jwt_1.default.verify(token);
            }
            catch (error) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INVALID_TOKEN), constants_1.default.BAD_REQUEST_CODE);
            }
            const { _id } = jwt_1.default.decode(token);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: _id },
            });
            const hashedPassword = crypto_1.default.encryptPassword(password);
            yield prisma_1.default.user.update({
                where: { id: _id },
                data: { password: hashedPassword },
            });
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.PASSWORD_RESET_SUCCESS);
        });
    },
    updatePassword: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { current_password, new_password } = req.body;
            const token = req.header(constants_1.default.AUTH_HEADER_NAME);
            const { _id } = jwt_1.default.decode(token);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: _id },
            });
            let isPasswordValid;
            if (process.env.NODE_ENV === "test") {
                isPasswordValid = current_password === user.password;
            }
            else {
                isPasswordValid = crypto_1.default.comparePassword(current_password, user.password);
            }
            if (!isPasswordValid) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INVALID_PASSWORD), constants_1.default.BAD_REQUEST_CODE);
            }
            let hashedPassword;
            if (process.env.NODE_ENV === "test") {
                hashedPassword = new_password;
            }
            else {
                hashedPassword = crypto_1.default.encryptPassword(new_password);
            }
            yield prisma_1.default.user.update({
                where: { id: _id },
                data: { password: hashedPassword },
            });
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
        });
    },
    uploadImage: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.files) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.FILE_NOT_UPLOADED), constants_1.default.BAD_REQUEST_CODE);
            }
            const file = Object.values(req.files)[0];
            if (file.size > constants_1.default.MAX_FILE_SIZE) {
                return helpers_1.default.sendAPIError(res, new Error(constants_1.default.FILE_TOO_LARGE), constants_1.default.BAD_REQUEST_CODE);
            }
            const imageName = yield upload_1.default.uploadFile(file, constants_1.default.IMAGES_FOLDER);
            const token = req.header(constants_1.default.AUTH_HEADER_NAME);
            const { _id } = jwt_1.default.decode(token);
            yield prisma_1.default.user.update({
                where: { id: _id },
                data: { image: imageName },
            });
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.IMAGE_UPLOADED);
        });
    },
    me: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.header(constants_1.default.AUTH_HEADER_NAME);
            const { _id } = jwt_1.default.decode(token);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: _id },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    role: true,
                    image: true,
                    profile_setup: true,
                },
            });
            let additionalData = {};
            if (user.role == client_1.ROLE.PATIENT) {
                additionalData = yield prisma_1.default.patient.findUnique({
                    where: { userId: user.id },
                    select: {
                        birthdate: true,
                    },
                });
            }
            else if (user.role == client_1.ROLE.DOCTOR) {
                const moreDate = yield prisma_1.default.doctor.findUnique({
                    where: { userId: user.id },
                    select: {
                        id: true,
                        hospital_clinic_name: true,
                        specialization: true,
                        location: {
                            select: {
                                address: true,
                                city: true,
                                state: true,
                            },
                        },
                        schedule: true,
                    },
                });
                const rating = yield prisma_1.default.reviews.aggregate({
                    where: { doctorId: moreDate.id },
                    _avg: {
                        rating: true,
                    },
                });
                additionalData = {
                    hospital_clinic_name: moreDate.hospital_clinic_name,
                    specialization: moreDate.specialization,
                    schedule: moreDate.schedule,
                    address: moreDate.location.address,
                    city: moreDate.location.city,
                    state: moreDate.location.state,
                    rating: rating._avg.rating,
                };
            }
            return helpers_1.default.sendAPISuccess(res, Object.assign(Object.assign({}, user), additionalData), constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
        });
    },
    updateInfo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { first_name, last_name, gender, specialization, birthdate } = req.body;
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const user = yield prisma_1.default.user.findUnique({
            where: { id: _id },
        });
        if (user.role == client_1.ROLE.PATIENT) {
            yield prisma_1.default.patient.update({
                where: { userId: _id },
                data: { birthdate },
            });
        }
        else if (user.role == client_1.ROLE.DOCTOR) {
            yield prisma_1.default.doctor.update({
                where: { userId: _id },
                data: { specialization },
            });
        }
        yield prisma_1.default.user.update({
            where: { id: _id },
            data: {
                first_name,
                last_name,
                gender,
            },
        });
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    updateHospitalInfo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { hospital_clinic_name, address, city, state } = req.body;
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        yield prisma_1.default.doctor.update({
            where: { userId: _id },
            data: {
                hospital_clinic_name,
                location: {
                    update: {
                        address,
                        city,
                        state,
                    },
                },
            },
        });
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    sendPhoneCode: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phone } = req.body;
            yield twilio_1.default.sendCode(phone);
            return helpers_1.default.sendAPISuccess(res, {
                phone,
            }, constants_1.default.SUCCESS_CODE, constants_1.default.VERIFICATION_CODE_SENT);
        });
    },
    verifyPhoneCode: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { phone, code } = req.body;
        const { _id } = jwt_1.default.decode(req.header(constants_1.default.AUTH_HEADER_NAME));
        const verificationCheck = yield twilio_1.default.verifyCode(phone, code);
        if (!verificationCheck.valid) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.INVALID_CODE), constants_1.default.BAD_REQUEST_CODE);
        }
        yield prisma_1.default.user.update({
            where: { id: _id },
            data: { phone_verified: true, phone },
        });
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.SUCCESS_CODE, constants_1.default.PHONE_VERIFIED);
    }),
};
//# sourceMappingURL=auth.controller.js.map