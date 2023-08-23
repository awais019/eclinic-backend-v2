import { Request, Response } from "express";
import APIHelpers from "../helpers";
import JWTHelpers from "../helpers/jwt";
import stripeHelpers from "../helpers/stripe";
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

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      select: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: patient.id,
        patient_name,
        date,
        time,
        type: appointment_type,
        message,
        charges: charges.amount,
      },
    });

    const price = await stripeHelpers.createAppointment(
      `${doctor.user.first_name} ${doctor.user.last_name}`,
      patient_name,
      appointment.id,
      charges.amount
    );

    const session = await stripeHelpers.createPaymentLink(price);

    APIHelpers.sendAPISuccess(
      res,
      { paymentLink: session.url },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
