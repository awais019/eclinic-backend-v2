import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";

export default {
  create: async function (req: Request, res: Response) {
    const { first_name, last_name, email, password, birthdate } = req.body;
    const user = {
      first_name,
      last_name,
      email,
      password,
    };
    const patient = await prisma.patient.create({
      data: {
        birthdate,
        user: {
          create: user,
        },
      },
      select: {
        id: true,
        birthdate: true,
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
    return helpers.sendAPISuccess(res, patient, constants.CREATED_CODE);
  },
};
