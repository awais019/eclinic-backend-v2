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
const helpers_1 = __importDefault(require("../helpers"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const constants_1 = __importDefault(require("../constants"));
const message_service_1 = __importDefault(require("../services/message.service"));
exports.default = {
    createorGetConversation: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const user = yield message_service_1.default.checkIfUserExists(userId);
        if (!user) {
            return helpers_1.default.sendAPIError(res, new Error(constants_1.default.BAD_REQUEST_MSG), constants_1.default.BAD_REQUEST_CODE);
        }
        const oldConversation = yield message_service_1.default.getConversation(_id, userId);
        if (oldConversation) {
            return helpers_1.default.sendAPISuccess(res, {
                id: oldConversation.id,
                Participant: oldConversation.Participant[0].User,
                Message: oldConversation.Message[0] || null,
            }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
        }
        const newConversation = yield message_service_1.default.createConversation(_id, userId);
        return helpers_1.default.sendAPISuccess(res, {
            id: newConversation.id,
            Participant: newConversation.Participant[0].User,
            Message: null,
        }, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getConversations: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.header(constants_1.default.AUTH_HEADER_NAME);
        const { _id } = jwt_1.default.decode(token);
        const conversations = yield message_service_1.default.getConversations(_id);
        return helpers_1.default.sendAPISuccess(res, conversations.map((conversation) => {
            const participant = conversation.Participant[0].User;
            const message = conversation.Message[0];
            return {
                id: conversation.id,
                Participant: participant,
                Message: message,
                unreadCount: conversation.unreadCount,
            };
        }), constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
    getMessages: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { conversationId } = req.params;
        const messages = yield message_service_1.default.getMessages(conversationId);
        return helpers_1.default.sendAPISuccess(res, messages, constants_1.default.SUCCESS_CODE, constants_1.default.SUCCESS_MSG);
    }),
};
//# sourceMappingURL=messages.controller.js.map