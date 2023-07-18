import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";

export default {
  create: async function (req: Request, res: Response) {
    let { first_name, last_name, email, gender, password, birthdate } =
      req.body;
    gender = gender.toUpperCase();
    birthdate = new Date(birthdate);
    const user = {
      first_name,
      last_name,
      email,
      gender,
      password,
    };
    let patient = await prisma.patient.create({
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
            phone: true,
            email_verified: true,
            phone_verified: true,
          },
        },
      },
    });
    patient = { ...patient, ...patient.user };
    delete patient.user;
    return helpers.sendAPISuccess(res, patient, constants.CREATED_CODE);
  },
};
