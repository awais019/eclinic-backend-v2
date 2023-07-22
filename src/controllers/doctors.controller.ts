import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import { ROLE } from "@prisma/client";
import helpers from "../helpers";
import cryptoHelpers from "../helpers/crypto";
import { UploadedFile } from "express-fileupload";

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
      latitude,
      longitude,
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
      latitude,
      longitude,
      address,
      city,
      state,
    };

    let degree_url = "";
    if (
      process.env.NODE_ENV == "production" ||
      process.env.NODE_ENV == "development"
    ) {
      try {
        let file: UploadedFile;
        if (!req.files) {
          file = req.files.file as UploadedFile;
          const uploadPath = uploadFile(file);
          degree_url = uploadPath;
        } else {
          throw new Error("File not found");
        }
      } catch (error) {
        return helpers.sendAPIError(res, error);
      }
    }

    await prisma.doctor.create({
      data: {
        specialization,
        hospital_clinic_name,
        degree_url,
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

function uploadFile(file: UploadedFile) {
  const fileName = file.name;
  const uploadPath = `${__dirname}/uploads/${fileName}`;
  file.mv(uploadPath, (err) => {
    if (err) {
      throw new Error(err.message);
    }
  });
  return uploadPath;
}
