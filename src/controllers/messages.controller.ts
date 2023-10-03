import { Request, Response } from "express";
import APIHelpers from "../helpers";
import JWTHelpers from "../helpers/jwt";
import constants from "../constants";
import { JwtPayload } from "jsonwebtoken";
import messageService from "../services/message.service";

export default {
  createorGetConversation: async (req: Request, res: Response) => {
    const { userId } = req.params;

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const user = await messageService.checkIfUserExists(userId);

    if (!user) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.BAD_REQUEST_MSG),
        constants.BAD_REQUEST_CODE
      );
    }

    const oldConversation = await messageService.getConversation(_id, userId);

    if (oldConversation) {
      return APIHelpers.sendAPISuccess(
        res,
        {
          id: oldConversation.id,
          Participant: oldConversation.Participant[0].User,
          Message: oldConversation.Message[0] || null,
        },
        constants.SUCCESS_CODE,
        constants.SUCCESS_MSG
      );
    }

    const newConversation = await messageService.createConversation(
      _id,
      userId
    );
    return APIHelpers.sendAPISuccess(
      res,
      {
        id: newConversation.id,
        Participant: newConversation.Participant[0].User,
        Message: null,
      },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getConversations: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const conversations = await messageService.getConversations(_id);

    return APIHelpers.sendAPISuccess(
      res,
      conversations.map((conversation) => {
        const participant = conversation.Participant[0].User;
        const message = conversation.Message[0];
        return {
          id: conversation.id,
          Participant: participant,
          Message: message,
          unreadCount: conversation.unreadCount,
        };
      }),
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getMessages: async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    const messages = await messageService.getMessages(conversationId);

    return APIHelpers.sendAPISuccess(
      res,
      messages,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
