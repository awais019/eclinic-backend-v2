import { Request, Response } from "express";
import prisma from "../prisma";
import jwtHelpers from "../helpers/jwt";
import cryptoHelpers from "../helpers/crypto";
import APIHelpers from "../helpers";
import { ROLE, VERIFICATION_STATUS } from "@prisma/client";
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
  getDoctors: async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      where: {
        email_verified: true,
        role: ROLE.DOCTOR,
      },
    });
    const doctors = await Promise.all(
      users.map(async (user) => {
        const doctor = await prisma.doctor.findFirst({
          where: {
            userId: user.id,
            verification: VERIFICATION_STATUS.PENDING,
          },
        });
        if (doctor == null) return null;
        const location = await prisma.location.findFirst({
          where: {
            id: doctor.locationId,
          },
        });
        const document = await prisma.document.findFirst({
          where: {
            doctorId: doctor.id,
          },
        });
        if (document) {
          return {
            ...user,
            ...location,
            ...doctor,
            documentURL: document.name,
          };
        }
        return null;
      })
    );

    APIHelpers.sendAPISuccess(
      res,
      doctors.filter((doctor) => doctor != null)
    );
  },
};
