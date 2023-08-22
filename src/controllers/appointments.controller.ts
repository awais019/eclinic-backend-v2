import { Request, Response } from "express";
import APIHelpers from "../helpers";
import JWTHelpers from "../helpers/jwt";
import constants from "../constants";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma";

export default {
  create: async function (req: Request, res: Response) {
    const { doctorId, patient_name, date, time, appointment_type, message } =
      req.body;

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const patient = await prisma.patient.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!patient) {
      APIHelpers.sendAPIError(
        res,
        new Error(constants.NOT_FOUND_MSG),
        constants.NOT_FOUND_CODE
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
      APIHelpers.sendAPIError(
        res,
        new Error(constants.DOCTOR_NOT_AVAILABLE),
        constants.BAD_REQUEST_CODE
      );
    }

    const charges = await prisma.charges.findFirst({
      where: {
        doctorId,
        appointment_type,
      },
      select: {
        amount: true,
      },
    });

    if (!charges) {
      APIHelpers.sendAPIError(
        res,
        new Error(constants.NOT_FOUND_MSG),
        constants.NOT_FOUND_CODE
      );
    }

    await prisma.appointment.create({
      data: {
        doctorId,
        patientId: _id,
        patient_name,
        date,
        time,
        type: appointment_type,
        message,
        charges: charges.amount,
      },
    });

    APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
