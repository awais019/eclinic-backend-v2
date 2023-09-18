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
const nodemailer_1 = require("nodemailer");
const logger_1 = __importDefault(require("../startup/logger"));
exports.default = {
    sendMail: (to, subject, text, attachments = null, html) => __awaiter(void 0, void 0, void 0, function* () {
        const transporter = (0, nodemailer_1.createTransport)({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        let mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
        };
        if (html) {
            delete mailOptions.text;
            mailOptions.html = html;
        }
        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }
        return transporter.sendMail(mailOptions, (error, info) => {
            if (info) {
                logger_1.default.info(info);
            }
            else if (error) {
                logger_1.default.error(error);
            }
        });
    }),
};
//# sourceMappingURL=email.js.map