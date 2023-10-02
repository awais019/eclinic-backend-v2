import { Server } from "socket.io";
import messageService from "../services/message.service";
import logger from "./logger";

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
        const message = await messageService.createMessage(data);
        io.to(data.conversationId).emit("message", message);
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
