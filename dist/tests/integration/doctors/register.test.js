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
const index_1 = __importDefault(require("../../../index"));
const prisma_1 = __importDefault(require("../../../prisma"));
const constants_1 = __importDefault(require("../../../constants"));
// test1: should return 400 if input is invalid
// test2: should return 201 if input is valid
// test3: should create a new doctor in the database
// test4: should return 400 if email is already registered
// test5: should return doctor if input is valid
describe("POST /api/doctors/register", () => {
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
        specialization: "specialization",
        hospital_clinic_name: "hospital_clinic_name",
        address: "address",
        city: "Cairo",
        state: "Cairo",
    };
    function exec() {
        return (0, supertest_1.default)(index_1.default).post("/api/doctors/register").send(body);
    }
    it(`Should return ${constants_1.default.BAD_REQUEST_CODE} if input is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.BAD_REQUEST_CODE);
    }));
    it(`Should return ${constants_1.default.CREATED_CODE} if input is valid`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.CREATED_CODE);
    }));
    it("Should create a new doctor in the database", () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        yield exec();
        const user = yield prisma_1.default.user.findUnique({
            where: { email: validBody.email },
        });
        const doctor = yield prisma_1.default.doctor.findUnique({
            where: { userId: user.id },
        });
        expect(doctor).toHaveProperty("userId", user.id);
    }));
    it("Should add ROLE DOCTOR to the user", () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        yield exec();
        const user = yield prisma_1.default.user.findUnique({
            where: { email: validBody.email },
        });
        expect(user).toHaveProperty("role", "DOCTOR");
    }));
    it(`Should return ${constants_1.default.BAD_REQUEST_CODE}  if email is already registered`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        yield exec();
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.BAD_REQUEST_CODE);
    }));
    it(`Should return ${constants_1.default.SUCCESS_MSG} msg if input is valid`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        const res = yield exec();
        expect(res.body).toHaveProperty("message", constants_1.default.SUCCESS_MSG);
    }));
});
//# sourceMappingURL=register.test.js.map