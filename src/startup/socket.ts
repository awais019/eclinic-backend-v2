import { Server } from "socket.io";
import messageService from "../services/message.service";
import logger from "./logger";
import { log } from "util";

export default function socket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info("User connected to socket");

    socket.on("join", (conversationId: string) => {
      socket.join(conversationId);
      logger.info(`User joined conversation ${conversationId}`);
    });

    socket.on(
      "message",
      async (data: {
        conversationId: string;
        message: string;
        sender: string;
        receiver: string;
      }) => {
        const { conversationId, message, sender, receiver } = data;

        io.to(conversationId).emit("message", data);
      }
    );

    socket.on("leave", (conversationId: string) => {
      socket.leave(conversationId);
      logger.info(`User left conversation ${conversationId}`);
    });

    socket.on("disconnect", () => {
      logger.info("User disconnected from socket");
    });
  });

  return io;
}
