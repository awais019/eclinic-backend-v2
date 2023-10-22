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
const socket_io_1 = require("socket.io");
const message_service_1 = __importDefault(require("../services/message.service"));
const logger_1 = __importDefault(require("./logger"));
function socket(server) {
    const clients = new Map();
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        logger_1.default.info("User connected to socket");
        socket.on("set-user", (id) => {
            clients.set(id, socket.id);
        });
        socket.on("join", (conversationId, userId) => __awaiter(this, void 0, void 0, function* () {
            socket.join(conversationId);
            yield message_service_1.default.updateMessages(conversationId, userId);
            logger_1.default.info(`User joined conversation ${conversationId}`);
        }));
        socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            const message = yield message_service_1.default.createMessage(data);
            const socketsInRoom = io.sockets.adapter.rooms.get(data.conversationId);
            if (socketsInRoom && socketsInRoom.size == 1) {
                const conversations = yield message_service_1.default.getConversations(data.receiver);
                const receiverSocketId = clients.get(data.receiver);
                io.to(receiverSocketId).emit("new-message", conversations.map((conversation) => {
                    return {
                        id: conversation.id,
                        Participant: conversation.Participant[0].User,
                        Message: conversation.Message[0],
                    };
                }));
            }
            io.to(data.conversationId).emit("message", message);
        }));
        socket.on("leave", (conversationId) => {
            socket.leave(conversationId);
            logger_1.default.info(`User left conversation ${conversationId}`);
        });
        socket.on("disconnect", () => {
            logger_1.default.info("User disconnected from socket");
        });
    });
    return io;
}
exports.default = socket;
//# sourceMappingURL=socket.js.map