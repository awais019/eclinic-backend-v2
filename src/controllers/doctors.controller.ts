import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import { ROLE } from "@prisma/client";
import helpers from "../helpers";
import cryptoHelpers from "../helpers/crypto";

export default {
  create: async (req: Request, res: Response) => {
    let {
      first_name,
      last_name,
      email,
      gender,
      password,
      specialization,
      hospital_clinic_name,
      address,
      city,
      state,
    } = req.body;
    gender = gender.toUpperCase();
    password = cryptoHelpers.encryptPassword(password);
    const user = {
      first_name,
      last_name,
      email,
      gender,
      password,
      role: ROLE.DOCTOR,
    };

    const location = {
      address,
      city,
      state,
    };

    const doctor = await prisma.doctor.create({
      data: {
        specialization,
        hospital_clinic_name,
        user: {
          create: user,
        },
        location: {
          create: location,
        },
      },
    });
    return helpers.sendAPISuccess(
      res,
      { doctorId: doctor.id },
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
};
