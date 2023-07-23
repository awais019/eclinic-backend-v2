import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import { ROLE } from "@prisma/client";
import helpers from "../helpers";
import uploadHelpers from "../helpers/upload";
import cryptoHelpers from "../helpers/crypto";
import { UploadedFile } from "express-fileupload";

export default {
  create: async (req: Request, res: Response) => { 
    if (!req.files) {
      return helpers.sendAPIError(
        res,
        new Error(constants.FILE_NOT_UPLOADED),
        constants.BAD_REQUEST_CODE
      );
    }

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

    const file = Object.values(req.files)[0];

    const url = await uploadHelpers.uploadFile(
      file as UploadedFile,
      constants.DOCUMENT_FOLDER
    );

    await prisma.$transaction(async () => {
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
      await prisma.document.create({
        data: {
          url,
          doctorId: doctor.id,
        },
      });
    });

    return helpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
};
