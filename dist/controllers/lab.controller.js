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
exports.default = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { name, address, city, state, email, password } = req.body;
        const labExists = yield prisma_1.default.lab.findFirst({
            where: {
                email,
            },
        });
        if (labExists) {
            return helpers_1.default.sendAPIError(res, new Error("Lab already exists"), constants_1.default.BAD_REQUEST_CODE);
        }
        password = crypto_1.default.encryptPassword(password);
        const lab = yield prisma_1.default.lab.create({
            data: {
                name,
                address,
                city,
                state,
                email,
                password,
            },
        });
        if (!lab) {
            return helpers_1.default.sendAPIError(res, new Error("Lab not created"), constants_1.default.BAD_REQUEST_CODE);
        }
        const token = jwt_1.default.sign({ _id: lab.id, email });
        const html = yield ejs_1.default.renderHTMLFile("email", {
            name: lab.name,
            link: `${process.env.CLIENT_URL}/?token=${token}`,
        });
        yield email_1.default.sendMail(email, "Welcome to Eclinic", null, null, html);
        return helpers_1.default.sendAPISuccess(res, null, constants_1.default.CREATED_CODE, constants_1.default.SUCCESS_MSG);
    }),
    signIn: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        const lab = yield prisma_1.default.lab.findFirst({
            where: {
                email,
            },
        });
        if (!lab.email_verified) {
            return helpers_1.default.sendAPIError(res, new Error("Email not verified"), constants_1.default.BAD_REQUEST_CODE);
        }
        if (!lab) {
            return helpers_1.default.sendAPIError(res, new Error("Invalid credentials"), constants_1.default.NOT_FOUND_CODE);
        }
        const isMatch = crypto_1.default.comparePassword(password, lab.password);
        if (!isMatch) {
            return helpers_1.default.sendAPIError(res, new Error("Invalid credentials"), constants_1.default.BAD_REQUEST_CODE);
        }
        const token = jwt_1.default.sign({ _id: lab.id, email });
        return helpers_1.default.sendAPISuccess(res, { token }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getLabs: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const q = req.query.q;
        const labs = yield prisma_1.default.lab.findMany({
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
            },
            where: {
                OR: [
                    {
                        name: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                    {
                        city: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                    {
                        state: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                ],
            },
        });
        return helpers_1.default.sendAPISuccess(res, { labs }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    requestTest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { labId, test, description } = req.body;
        const lab = yield prisma_1.default.lab.findFirst({
            where: {
                id: labId,
            },
        });
        if (!lab) {
            return helpers_1.default.sendAPIError(res, new Error("Lab not found"), constants_1.default.NOT_FOUND_CODE);
        }
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const patient = yield prisma_1.default.patient.findFirst({
            where: {
                userId: _id,
            },
        });
        if (!patient) {
            return helpers_1.default.sendAPIError(res, new Error("Patient not found"), constants_1.default.NOT_FOUND_CODE);
        }
        const testRequest = yield prisma_1.default.test.create({
            data: {
                labId,
                patientId: patient.id,
                name: test,
                description,
            },
        });
        if (!testRequest) {
            return helpers_1.default.sendAPIError(res, new Error("Test request not created"), constants_1.default.BAD_REQUEST_CODE);
        }
        return helpers_1.default.sendAPISuccess(res, { testRequest }, constants_1.default.CREATED_CODE, constants_1.default.SUCCESS_MSG);
    }),
    uploadReport: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { testId } = req.params;
        const test = yield prisma_1.default.test.findFirst({
            where: {
                id: testId,
            },
        });
        if (!test) {
            return helpers_1.default.sendAPIError(res, new Error("Test not found"), constants_1.default.NOT_FOUND_CODE);
        }
        const file = Object.values(req.files)[0];
        if (file.size > constants_1.default.MAX_FILE_SIZE) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.FILE_TOO_LARGE), constants_1.default.BAD_REQUEST_CODE);
        }
        const fileName = yield upload_1.default.uploadFile(file, constants_1.default.REPORTS_FOLDER);
        const report = yield prisma_1.default.report.create({
            data: {
                testId,
                name: fileName,
            },
        });
        return helpers_1.default.sendAPISuccess(res, report, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getTests: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const tests = yield prisma_1.default.test.findMany({
            where: {
                labId: _id,
            },
            orderBy: {
                created_at: "desc",
            },
        });
        return helpers_1.default.sendAPISuccess(res, { tests }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
};
//# sourceMappingURL=lab.controller.js.map