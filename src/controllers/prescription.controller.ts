import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";
import jwtHelpers from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";

export default {
  create: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const { prescription, appointmentId } = req.body;

    if (!appointmentId || !prescription) {
      return helpers.sendAPIError(
        res,
        new Error(constants.BAD_REQUEST_MSG),
        constants.BAD_REQUEST_CODE
      );
    }

    await prisma.$transaction(async () => {
      await prisma.prescription.create({
        data: {
          appointmentId,
          Medication: {
            createMany: {
              data: prescription,
            },
          },
        },
      });
      await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          completed: true,
        },
      });
    });

    helpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
