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
const supertest_1 = __importDefault(require("supertest"));
const prisma_1 = __importDefault(require("../../../prisma"));
const index_1 = __importDefault(require("../../../index"));
const constants_1 = __importDefault(require("../../../constants"));
// return 400 if invalid data is provided
// return 400 if email is already in use
// hash the password before saving it to the database
// return 201 if valid data is provided
// save the patient to the database
// return the patient if valid data is provided
describe("POST /api/patients/register", () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        index_1.default.close();
        yield prisma_1.default.clearDB();
        yield prisma_1.default.$disconnect();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        index_1.default.close();
        yield prisma_1.default.clearDB();
        yield prisma_1.default.$disconnect();
    }));
    let body = {};
    const validBody = {
        first_name: "John",
        last_name: "Doe",
        email: "john@gmail.com",
        password: "123456789",
        gender: "male",
        birthdate: new Date(),
    };
    function exec() {
        return (0, supertest_1.default)(index_1.default).post("/api/patients/register").send(body);
    }
    it(`Should return ${constants_1.default.BAD_REQUEST_CODE} if input is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.BAD_REQUEST_CODE);
    }));
    it(`Should return ${constants_1.default.BAD_REQUEST_CODE} if email is already in use`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.default.patient.create({
            data: {
                birthdate: new Date(),
                user: {
                    create: {
                        first_name: "John",
                        last_name: "Doe",
                        email: "john@gmail.com",
                        gender: "MALE",
                        password: "123456789",
                    },
                },
            },
        });
        body = validBody;
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.BAD_REQUEST_CODE);
    }));
    it(`Should return ${constants_1.default.CREATED_CODE} if valid data is provided`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.CREATED_CODE);
    }));
    it("Should save the patient to the database", () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        yield exec();
        const user = yield prisma_1.default.user.findUnique({
            where: { email: validBody.email },
        });
        const patientInDB = yield prisma_1.default.patient.findUnique({
            where: { userId: user.id },
        });
        expect(patientInDB.id).toBeTruthy();
    }));
    it(`Should return the ${constants_1.default.SUCCESS_MSG} if valid data is provided`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        const res = yield exec();
        expect(res.body).toHaveProperty("message", constants_1.default.SUCCESS_MSG);
    }));
});
//# sourceMappingURL=register.test.js.map