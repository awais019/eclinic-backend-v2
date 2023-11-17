import { Request, Response } from "express";
import prisma from "../prisma";
import constants from "../constants";
import jwtHelpers from "../helpers/jwt";
import cryptoHelpers from "../helpers/crypto";
import APIHelpers from "../helpers";
import ejsHelpers from "../helpers/ejs";
import emailHelpers from "../helpers/email";
import uploadHelpers from "../helpers/upload";
import { UploadedFile } from "express-fileupload";
import { Lab } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

export default {
  register: async (req: Request, res: Response) => {
    let { name, address, city, state, email, password } = req.body;

    const labExists = await prisma.lab.findFirst({
      where: {
        email,
      },
    });

    if (labExists) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Lab already exists"),
        constants.BAD_REQUEST_CODE
      );
    }
    password = cryptoHelpers.encryptPassword(password);

    const lab = await prisma.lab.create({
      data: {
        name,
        address,
        city,
        state,
        email,
        password,
      },
    });

    if (!lab) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Lab not created"),
        constants.BAD_REQUEST_CODE
      );
    }

    const token = jwtHelpers.sign({ _id: lab.id, email });

    const html = await ejsHelpers.renderHTMLFile("email", {
      name: lab.name,
      link: `${process.env.CLIENT_URL}/?token=${token}`,
    });
    await emailHelpers.sendMail(email, "Welcome to Eclinic", null, null, html);

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
  signIn: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const lab = await prisma.lab.findFirst({
      where: {
        email,
      },
    });

    if (!lab.email_verified) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Email not verified"),
        constants.BAD_REQUEST_CODE
      );
    }

    if (!lab) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Invalid credentials"),
        constants.NOT_FOUND_CODE
      );
    }

    const isMatch = cryptoHelpers.comparePassword(password, lab.password);

    if (!isMatch) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Invalid credentials"),
        constants.BAD_REQUEST_CODE
      );
    }

    const token = jwtHelpers.sign({ _id: lab.id, email });

    return APIHelpers.sendAPISuccess(
      res,
      { token },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getLabs: async (req: Request, res: Response) => {
    const q = req.query.q as string;

    const labs = await prisma.lab.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
      },
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            state: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return APIHelpers.sendAPISuccess(
      res,
      { labs },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },

  requestTest: async (req: Request, res: Response) => {
    const { labId, test, description } = req.body;

    const lab = await prisma.lab.findFirst({
      where: {
        id: labId,
      },
    });

    if (!lab) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Lab not found"),
        constants.NOT_FOUND_CODE
      );
    }

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const patient = await prisma.patient.findFirst({
      where: {
        userId: _id,
      },
    });

    if (!patient) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Patient not found"),
        constants.NOT_FOUND_CODE
      );
    }

    const testRequest = await prisma.test.create({
      data: {
        labId,
        patientId: patient.id,
        name: test,
        description,
      },
    });

    if (!testRequest) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Test request not created"),
        constants.BAD_REQUEST_CODE
      );
    }

    return APIHelpers.sendAPISuccess(
      res,
      { testRequest },
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
  uploadReport: async (req: Request, res: Response) => {
    const { testId } = req.params;

    const test = await prisma.test.findFirst({
      where: {
        id: testId,
      },
    });

    if (!test) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Test not found"),
        constants.NOT_FOUND_CODE
      );
    }

    const file = Object.values(req.files)[0] as UploadedFile;
    if (file.size > constants.MAX_FILE_SIZE) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.FILE_TOO_LARGE),
        constants.BAD_REQUEST_CODE
      );
    }
    const fileName = await uploadHelpers.uploadFile(
      file,
      constants.REPORTS_FOLDER
    );

    const report = await prisma.report.create({
      data: {
        testId,
        name: fileName,
      },
    });

    return APIHelpers.sendAPISuccess(
      res,
      report,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getTests: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const tests = await prisma.test.findMany({
      where: {
        labId: _id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return APIHelpers.sendAPISuccess(
      res,
      { tests },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
