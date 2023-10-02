import { Server } from "socket.io";
import messageService from "../services/message.service";
import logger from "./logger";

export default function socket(server: any) {
  const clients = new Map();

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info("User connected to socket");

    socket.on("set-user", (id: string) => {
      clients.set(id, socket.id);
    });

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

        const socketsInRoom = io.sockets.adapter.rooms.get(data.conversationId);

        if (socketsInRoom && socketsInRoom.size == 1) {
          console.log("sending notification");
          const conversations = await messageService.getConversations(
            data.receiver
          );
          const receiverSocketId = clients.get(data.receiver);
          io.to(receiverSocketId).emit(
            "new-message",
            conversations.map((conversation) => {
              return {
                id: conversation.id,
                Participant: conversation.Participant[0].User,
                Message: conversation.Message[0],
              };
            })
          );
        }
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
