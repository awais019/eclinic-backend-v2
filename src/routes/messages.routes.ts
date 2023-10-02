import express from "express";
import authMiddleware from "../middlewares/auth";
import trycatchMiddleware from "../middlewares/trycatch";
import messages from "../controllers/messages.controller";

const router = express.Router();

router.get(
  "/:userId",
  authMiddleware(),
  trycatchMiddleware(messages.createorGetConversation)
);

router.get(
  "/conversations/list",
  authMiddleware(),
  trycatchMiddleware(messages.getConversations)
);

export default router;
