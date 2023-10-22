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
const jwt_1 = __importDefault(require("../helpers/jwt"));
const twilio_1 = __importDefault(require("../helpers/twilio"));
const helpers_1 = __importDefault(require("../helpers"));
exports.default = {
    createCall: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const roomName = `${_id}-${userId}`;
        const room = yield twilio_1.default.createVideoRoom(roomName);
        helpers_1.default.sendAPISuccess(res, room.sid, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
};
//# sourceMappingURL=calls.controller.js.map