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
// 1. Return 400 if no email and password is provided
// 4. Return 401 if email is not registered
// 3. Return 401 if password is incorrect
// 5. Return 403 if email and password is correct and user is not verified
// 6. Return 200 if email and password is correct and user is verified
describe("POST /auth/signin", () => {
    function createUser() {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.patient.create({
                data: {
                    birthdate: new Date(),
                    user: {
                        create: {
                            first_name: "John",
                            last_name: "Doe",
                            email: "john@gmail.com",
                            password: "password",
                            gender: "MALE",
                        },
                    },
                },
            });
        });
    }
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        index_1.default.close();
        yield prisma_1.default.clearDB();
        yield createUser();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        index_1.default.close();
        yield prisma_1.default.clearDB();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        index_1.default.close();
        yield prisma_1.default.clearDB();
        yield prisma_1.default.$disconnect();
    }));
    const validBody = {
        email: "john@gmail.com",
        password: "password",
    };
    let body = {};
    function exec() {
        return (0, supertest_1.default)(index_1.default).post("/api/auth/signin").send(body);
    }
    it(`Should return ${constants_1.default.BAD_REQUEST_CODE} if input is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.BAD_REQUEST_CODE);
    }));
    it(`Should return ${constants_1.default.UNAUTHORIZED_CODE} if email is not registered`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = Object.assign(Object.assign({}, validBody), { email: "johndoe@gmail.com" });
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.UNAUTHORIZED_CODE);
    }));
    it(`Should return ${constants_1.default.UNAUTHORIZED_CODE} if password is incorrect`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = Object.assign(Object.assign({}, validBody), { password: "wrongpassword" });
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.UNAUTHORIZED_CODE);
    }));
    it(`Should return ${constants_1.default.FORBIDDEN_CODE} if input is valid but user is not verified`, () => __awaiter(void 0, void 0, void 0, function* () {
        body = validBody;
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.FORBIDDEN_CODE);
    }));
    it(`Should return ${constants_1.default.SUCCESS_CODE} if input is valid and user is verified`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.default.user.update({
            where: { email: validBody.email },
            data: {
                email_verified: true,
            },
        });
        body = validBody;
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.SUCCESS_CODE);
    }));
    it(`Should return a valid JWT if input is valid and user is verified`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.default.user.update({
            where: { email: validBody.email },
            data: {
                email_verified: true,
            },
        });
        body = validBody;
        const res = yield exec();
        expect(res.status).toBe(constants_1.default.SUCCESS_CODE);
        expect(res.body.data).toHaveProperty("token");
    }));
});
//# sourceMappingURL=signin.test.js.map