import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import { ROLE } from "@prisma/client";
import { UploadedFile } from "express-fileupload";
import helpers from "../helpers";
import uploadHelpers from "../helpers/upload";
import cryptoHelpers from "../helpers/crypto";
import jwtHelpers from "../helpers/jwt";
import emailHelpers from "../helpers/email";
import ejsHelpers from "../helpers/ejs";
import { JwtPayload } from "jsonwebtoken";
import { DoctorSchedule } from "doctor";

export default {
  create: async (req: Request, res: Response) => {
    if (!req.files && process.env.NODE_ENV !== "test") {
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

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      return helpers.sendAPIError(
        res,
        new Error("Account already exists with this email."),
        constants.BAD_REQUEST_CODE
      );
    }

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

    let fileName = "";

    if (
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "development"
    ) {
      const file = Object.values(req.files)[0] as UploadedFile;
      if (file.size > constants.MAX_FILE_SIZE) {
        return helpers.sendAPIError(
          res,
          new Error(constants.FILE_TOO_LARGE),
          constants.BAD_REQUEST_CODE
        );
      }
      fileName = await uploadHelpers.uploadFile(
        file,
        constants.DOCUMENT_FOLDER
      );
    }

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
          name: fileName,
          doctorId: doctor.id,
        },
      });

      if (process.env.NODE_ENV != "test") {
        const token = jwtHelpers.sign({ _id: doctor.userId, email });

        const html = await ejsHelpers.renderHTMLFile("email", {
          name: first_name,
          link: `${process.env.CLIENT_URL}/?token=${token}`,
        });
        await emailHelpers.sendMail(
          email,
          "Welcome to Eclinic",
          null,
          null,
          html
        );
      }
    });

    return helpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
  setSchedule: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);
    let schedule = req.body;
    const { _id } = jwtHelpers.decode(token) as JwtPayload;
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    schedule = schedule.map((s: DoctorSchedule) => {
      return {
        ...s,
        day: s.day.toUpperCase(),
        doctorId: doctor.id,
      };
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    try {
      await prisma.schedule.createMany({
        data: schedule,
      });
    } catch (error) {
      return helpers.sendAPIError(
        res,
        new Error(constants.INTERNAL_SERVER_ERROR_MSG),
        constants.INTERNAL_SERVER_ERROR_CODE
      );
    }

    return helpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
  updateSchedule: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);
    let schedule = req.body;
    const { _id } = jwtHelpers.decode(token) as JwtPayload;
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    schedule = schedule.map((s: DoctorSchedule) => {
      return {
        ...s,
        day: s.day.toUpperCase(),
        doctorId: doctor.id,
      };
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    try {
      await prisma.schedule.deleteMany({
        where: {
          doctorId: doctor.id,
        },
      });
      await prisma.schedule.createMany({
        data: schedule,
      });
    } catch (error) {
      return helpers.sendAPIError(
        res,
        new Error(constants.INTERNAL_SERVER_ERROR_MSG),
        constants.INTERNAL_SERVER_ERROR_CODE
      );
    }

    return helpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  setCharges: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);
    let charges = req.body;
    const { _id } = jwtHelpers.decode(token) as JwtPayload;
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    charges = charges.map((c: any) => {
      return {
        ...c,
        doctorId: doctor.id,
      };
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    if (charges.length == 2) {
      await prisma.doctor.update({
        where: {
          id: doctor.id,
        },
        data: {
          appoinment_types_allowed: ["PHYSICAL", "VIRTUAL"],
        },
      });
    }

    try {
      await prisma.charges.createMany({
        data: charges,
      });
    } catch (error) {
      return helpers.sendAPIError(
        res,
        new Error(constants.INTERNAL_SERVER_ERROR_MSG),
        constants.INTERNAL_SERVER_ERROR_CODE
      );
    }

    return helpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
};
