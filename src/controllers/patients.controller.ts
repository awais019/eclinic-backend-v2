import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";

export default {
  create: async function (req: Request, res: Response) {
    const { first_name, last_name, email, password, birthdate } = req.body;
    const patient = await prisma.patient.create({
      data: {
        birthdate,
        user: {
          create: {
            first_name,
            last_name,
            email,
            password,
          },
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
    return res.status(constants.CREATED_CODE).send(patient);
  },
};
