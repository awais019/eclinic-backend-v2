import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";
import jwtHelpers from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";

export default {
  getTransactions: async (req: Request, res: Response) => {
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

    const transactions = await prisma.transactions.findMany({
      where: {
        doctor_id: doctor.id,
      },
      select: {
        id: true,
        created_at: true,
        amount: true,
        Appointment: {
          select: {
            patient_name: true,
            type: true,
          },
        },
      },
    });

    return helpers.sendAPISuccess(
      res,
      transactions.map((t) => {
        return {
          id: t.id,
          patient_name: t.Appointment.patient_name,
          amount: t.amount,
          type: t.Appointment.type,
          created_at: t.created_at,
        };
      }),
      constants.SUCCESS_CODE
    );
  },
};
