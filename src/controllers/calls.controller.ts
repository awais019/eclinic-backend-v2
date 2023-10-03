import { Request, Response } from "express";
import constants from "../constants";
import JWTHelpers from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";
import twilio from "../helpers/twilio";
import APIHelpers from "../helpers";

export default {
  createCall: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const roomName = `${_id}-${userId}`;

    const room = await twilio.createVideoRoom(roomName);

    APIHelpers.sendAPISuccess(
      res,
      room.sid,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
