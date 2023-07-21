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
    } = req.body;
    const location = req.body.location;
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
    await prisma.doctor.create({
      data: {
        specialization,
        hospital_clinic_name,
        degree_url: "",
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
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
};
