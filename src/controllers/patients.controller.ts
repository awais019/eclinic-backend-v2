import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";
import cryptoHelpers from "../helpers/crypto";

export default {
  create: async function (req: Request, res: Response) {
    let { first_name, last_name, email, gender, password, birthdate } =
      req.body;
    gender = gender.toUpperCase();
    birthdate = new Date(birthdate);
    password = cryptoHelpers.encryptPassword(password);
    const user = {
      first_name,
      last_name,
      email,
      gender,
      password,
    };
    await prisma.patient.create({
      data: {
        birthdate,
        user: {
          create: user,
        },
      },
    });
    return helpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
};
