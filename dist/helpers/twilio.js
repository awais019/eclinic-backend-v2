"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twilio_1 = __importDefault(require("twilio"));
const constants_1 = __importDefault(require("../constants"));
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
exports.default = {
    sendCode: (phone) => {
        return twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SID)
            .verifications.create({
            to: phone,
            channel: constants_1.default.TWILIO_CHANNEL,
        });
    },
    verifyCode: (phone, code) => {
        return twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SID)
            .verificationChecks.create({
            to: phone,
            code,
        });
    },
    createVideoRoom: (roomName) => {
        return twilioClient.video.rooms.create({
            uniqueName: roomName,
            type: "peer-to-peer",
            recordParticipantsOnConnect: true,
        });
    },
    generateToken: (identity, roomName) => {
        const token = new twilio_1.default.jwt.AccessToken(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, { identity });
    },
};
//# sourceMappingURL=twilio.js.map