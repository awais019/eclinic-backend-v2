"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const messages_controller_1 = __importDefault(require("../controllers/messages.controller"));
const router = express_1.default.Router();
router.get("/:userId", (0, auth_1.default)(), (0, trycatch_1.default)(messages_controller_1.default.createorGetConversation));
router.get("/conversations/list", (0, auth_1.default)(), (0, trycatch_1.default)(messages_controller_1.default.getConversations));
router.get("/:conversationId/messages", (0, auth_1.default)(), (0, trycatch_1.default)(messages_controller_1.default.getMessages));
exports.default = router;
//# sourceMappingURL=messages.routes.js.map