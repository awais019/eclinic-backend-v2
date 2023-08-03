import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";
import cryptoHelpers from "../helpers/crypto";
import jwtHelpers from "../helpers/jwt";
import emailHelpers from "../helpers/email";
import ejsHelpers from "../helpers/ejs";
import { JwtPayload } from "jsonwebtoken";

export default {
  create: async function (req: Request, res: Response) {
    let { first_name, last_name, email, gender, password, birthdate } =
      req.body;

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
    birthdate = new Date(birthdate);
    password = cryptoHelpers.encryptPassword(password);
    const user = {
      first_name,
      last_name,
      email,
      gender,
      password,
    };
    const patient = await prisma.patient.create({
      data: {
        birthdate,
        user: {
          create: user,
        },
      },
    });

    if (process.env.NODE_ENV !== "test") {
      const token = jwtHelpers.sign({ _id: patient.userId, email });

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

    return helpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
  bookAppointment: async function (req: Request, res: Response) {
    const { doctorId, date, time, duration, charges, type } = req.body;

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const patient = await prisma.patient.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!patient) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const appointmentExists = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        time,
      },
    });

    if (appointmentExists) {
      return helpers.sendAPIError(
        res,
        new Error(constants.DOCTOR_NOT_AVAILABLE),
        constants.BAD_REQUEST_CODE
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: _id,
        date,
        time,
        duration,
        charges,
        type,
      },
    });

    return helpers.sendAPISuccess(
      res,
      appointment,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
};
