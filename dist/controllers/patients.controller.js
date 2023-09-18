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
const crypto_1 = __importDefault(require("../helpers/crypto"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const email_1 = __importDefault(require("../helpers/email"));
const ejs_1 = __importDefault(require("../helpers/ejs"));
exports.default = {
    create: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { first_name, last_name, email, gender, password, birthdate } = req.body;
            const userExists = yield prisma_1.default.user.findUnique({
                where: {
                    email,
                },
            });
            if (userExists) {
                return helpers_1.default.sendAPIError(res, new Error("Account already exists with this email."), constants_1.default.BAD_REQUEST_CODE);
            }
            gender = gender.toUpperCase();
            birthdate = new Date(birthdate);
            password = crypto_1.default.encryptPassword(password);
            const user = {
                first_name,
                last_name,
                email,
                gender,
                password,
            };
            const patient = yield prisma_1.default.patient.create({
                data: {
                    birthdate,
                    user: {
                        create: user,
                    },
                },
            });
            if (process.env.NODE_ENV !== "test") {
                const token = jwt_1.default.sign({ _id: patient.userId, email });
                const html = yield ejs_1.default.renderHTMLFile("email", {
                    name: first_name,
                    link: `${process.env.CLIENT_URL}/?token=${token}`,
                });
                yield email_1.default.sendMail(email, "Welcome to Eclinic", null, null, html);
            }
            return helpers_1.default.sendAPISuccess(res, null, constants_1.default.CREATED_CODE, constants_1.default.SUCCESS_MSG);
        });
    },
};
//# sourceMappingURL=patients.controller.js.map