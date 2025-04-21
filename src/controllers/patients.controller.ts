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
      helpers.sendAPIError(
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
  getTests: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const patient = await prisma.patient.findUnique({
      where: { userId: _id },
    });

    if (!patient) {
      helpers.sendAPIError(
        res,
        new Error("Patient not found"),
        constants.BAD_REQUEST_CODE
      );
    }
    const tests = await prisma.test.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        Lab: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
    });
    return helpers.sendAPISuccess(res, tests);
  },
  getReports: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);
    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const patient = await prisma.patient.findUnique({
      where: { userId: _id },
    });

    if (!patient) {
      helpers.sendAPIError(
        res,
        new Error("Patient not found"),
        constants.BAD_REQUEST_CODE
      );
    }

    const tests = await prisma.test.findMany({
      where: {
        patientId: patient.id,
      },
      select: {
        id: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const reports = await prisma.report.findMany({
      where: {
        testId: {
          in: tests.map((test) => test.id),
        },
      },
    });

    return helpers.sendAPISuccess(res, reports);
  },
};
