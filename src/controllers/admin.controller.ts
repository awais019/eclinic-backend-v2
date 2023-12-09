import { Request, Response } from "express";
import prisma from "../prisma";
import jwtHelpers from "../helpers/jwt";
import cryptoHelpers from "../helpers/crypto";
import APIHelpers from "../helpers";
import { ROLE } from "@prisma/client";
import constants from "../constants";

export default {
  create: async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, gender } = req.body;

    let user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.USER_ALREADY_EXISTS),
        constants.BAD_REQUEST_CODE
      );
    }

    const hashedPassword = cryptoHelpers.encryptPassword(password);

    user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        role: ROLE.ADMIN,
        gender,
      },
    });

    const token = jwtHelpers.sign({
      _id: user.id,
      role: user.role,
      email: user.email,
    });

    APIHelpers.sendAPISuccess(res, {
      token,
    });
  },
};
