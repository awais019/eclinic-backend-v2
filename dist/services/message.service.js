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
exports.default = {
    checkIfUserExists: (userId) => {
        return prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
    },
    getConversation: (_id, userId) => {
        return prisma_1.default.conversation.findFirst({
            where: {
                Participant: {
                    every: {
                        userId: {
                            in: [_id, userId],
                        },
                    },
                },
            },
            include: {
                Participant: {
                    where: { userId: { not: _id } },
                    select: {
                        User: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                image: true,
                            },
                        },
                    },
                },
                Message: {
                    select: {
                        id: true,
                        message: true,
                        created_at: true,
                        sender: true,
                        receiver: true,
                    },
                    orderBy: {
                        created_at: "desc",
                    },
                    take: 1,
                },
            },
        });
    },
    createConversation: (_id, userId) => {
        return prisma_1.default.conversation.create({
            data: {
                Participant: {
                    createMany: {
                        data: [
                            {
                                userId: _id,
                            },
                            {
                                userId: userId,
                            },
                        ],
                    },
                },
            },
            include: {
                Participant: {
                    where: { userId: { not: _id } },
                    select: {
                        User: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });
    },
    getConversations: (_id) => __awaiter(void 0, void 0, void 0, function* () {
        const conversations = yield prisma_1.default.conversation.findMany({
            where: {
                Participant: {
                    some: {
                        userId: _id,
                    },
                },
            },
            orderBy: {
                updated_at: "desc",
            },
            select: {
                id: true,
                Participant: {
                    where: { userId: { not: _id } },
                    select: {
                        User: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                image: true,
                            },
                        },
                    },
                },
                Message: {
                    select: {
                        id: true,
                        message: true,
                        created_at: true,
                        sender: true,
                        receiver: true,
                    },
                    orderBy: {
                        created_at: "desc",
                    },
                    take: 1,
                },
            },
        });
        const _conversations = [];
        for (let index = 0; index < conversations.length; index++) {
            const unreadCount = yield prisma_1.default.message.count({
                where: {
                    conversationId: conversations[index].id,
                    receiver: _id,
                    read: false,
                },
            });
            _conversations.push(Object.assign(Object.assign({}, conversations[index]), { unreadCount }));
        }
        return _conversations;
    }),
    createMessage: ({ conversationId, message, sender, receiver, }) => __awaiter(void 0, void 0, void 0, function* () {
        const messages = yield prisma_1.default.message.create({
            data: {
                conversationId,
                message,
                sender,
                receiver,
            },
        });
        yield prisma_1.default.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                updated_at: new Date(),
            },
        });
        return messages;
    }),
    getMessages: (conversationId) => {
        return prisma_1.default.message.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                created_at: "asc",
            },
        });
    },
    updateMessages: (conversationId, userId) => {
        return prisma_1.default.message.updateMany({
            where: {
                conversationId,
                receiver: userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
    },
};
//# sourceMappingURL=message.service.js.map