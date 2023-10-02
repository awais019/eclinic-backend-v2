import { Request, Response } from "express";
import APIHelpers from "../helpers";
import JWTHelpers from "../helpers/jwt";
import constants from "../constants";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma";

export default {
  createorGetConversation: async (req: Request, res: Response) => {
    const { userId } = req.params;

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.BAD_REQUEST_MSG),
        constants.BAD_REQUEST_CODE
      );
    }

    const oldConversation = await prisma.conversation.findFirst({
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
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
    });

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

    const newConversation = await prisma.conversation.create({
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

    const conversations = await prisma.conversation.findMany({
      where: {
        Participant: {
          some: {
            userId: _id,
          },
        },
        Message: {
          some: {},
        },
      },
      select: {
        id: true,
        Participant: {
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
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
    });

    return APIHelpers.sendAPISuccess(
      res,
      conversations.map((conversation) => {
        const participant = conversation.Participant[0].User;
        const message = conversation.Message[0];
        return {
          id: conversation.id,
          participant,
          message,
        };
      }),
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
