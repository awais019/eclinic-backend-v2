import { Request, Response } from "express";
import APIHelpers from "../helpers";
import JWTHelpers from "../helpers/jwt";
import stripeHelpers from "../helpers/stripe";
import constants from "../constants";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma";
import { PAYMENT_STATUS, APPOINTMENT_STATUS } from "@prisma/client";

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
      return APIHelpers.sendAPIError(
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
      return APIHelpers.sendAPIError(
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
      return APIHelpers.sendAPIError(
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

    await prisma.transactions.create({
      data: {
        appointment_id: appointment.id,
        doctor_id: doctorId,
        patient_id: patient.id,
        amount: charges.amount,
        status: PAYMENT_STATUS.PAID,
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
      { paymentLink: session.url, id: appointment.id },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getDoctorAppointments: async (req: Request, res: Response) => {
    const { date } = req.query;
    const _date = new Date(date as string);
    _date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!doctor) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: date
          ? _date
          : {
              gte: today,
            },
        completed: false,
        status: APPOINTMENT_STATUS.ACCEPTED,
        payment_status: PAYMENT_STATUS.PAID,
      },
      select: {
        id: true,
        patient_name: true,
        date: true,
        time: true,
        type: true,
        charges: true,
        message: true,
        completed: true,
        Patient: {
          select: {
            user: {
              select: {
                id: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const _appointments = appointments.map((appointment) => ({
      ...appointment,
      userId: appointment.Patient.user.id,
      image: appointment.Patient.user.image,
    }));

    _appointments.forEach((appointment) => {
      delete appointment.Patient;
    });

    APIHelpers.sendAPISuccess(
      res,
      _appointments,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getPatientAppointments: async (req: Request, res: Response) => {
    const { date } = req.query;
    const _date = new Date(date as string);
    _date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const patient = await prisma.patient.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!patient) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        date: date
          ? _date
          : {
              gt: today,
            },
        completed: false,
        status: APPOINTMENT_STATUS.ACCEPTED,
        payment_status: PAYMENT_STATUS.PAID,
      },
      select: {
        id: true,
        patient_name: true,
        date: true,
        time: true,
        type: true,
        charges: true,
        message: true,
        completed: true,
        Doctor: {
          select: {
            specialization: true,
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const _appointments = appointments.map((appointment) => ({
      ...appointment,
      doctor: {
        userId: appointment.Doctor.user.id,
        first_name: appointment.Doctor.user.first_name,
        last_name: appointment.Doctor.user.last_name,
        specialization: appointment.Doctor.specialization,
      },
      image: appointment.Doctor.user.image,
    }));

    _appointments.forEach((appointment) => {
      delete appointment.Doctor;
    });

    APIHelpers.sendAPISuccess(
      res,
      _appointments,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  cancelAppointment: async (req: Request, res: Response) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.BAD_REQUEST_MSG),
        constants.BAD_REQUEST_CODE
      );
    }
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    await prisma.appointment.update({
      where: {
        id: appointmentId,
        date: {
          gt: date,
        },
      },
      data: {
        status: APPOINTMENT_STATUS.CANCELLED,
      },
    });

    APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  updatePaymentStatus: async (req: Request, res: Response) => {
    const id = req.params.id;

    const appointment = await prisma.appointment.update({
      where: {
        id,
        payment_status: PAYMENT_STATUS.PENDING,
      },
      data: { payment_status: PAYMENT_STATUS.PAID },
      select: {
        date: true,
        time: true,
        type: true,
        Doctor: {
          select: {
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.NOT_FOUND_MSG),
        constants.NOT_FOUND_CODE
      );
    }

    APIHelpers.sendAPISuccess(
      res,
      {
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        doctor: `${appointment.Doctor.user.first_name} ${appointment.Doctor.user.last_name}`,
      },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getCompletedAppointments: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!doctor) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        completed: true,
      },
      select: {
        id: true,
        patient_name: true,
        date: true,
        time: true,
        type: true,
        charges: true,
        completed: true,
        Patient: {
          select: {
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const _appointments = appointments.map((appointment) => ({
      ...appointment,
      image: appointment.Patient.user.image,
    }));

    _appointments.forEach((appointment) => {
      delete appointment.Patient;
    });

    APIHelpers.sendAPISuccess(
      res,
      _appointments,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getAppointmentRequests: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = JWTHelpers.decode(token) as JwtPayload;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!doctor) {
      APIHelpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: APPOINTMENT_STATUS.PENDING,
        date: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        patient_name: true,
        date: true,
        time: true,
        type: true,
        charges: true,
        message: true,
        Patient: {
          select: {
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const _appointments = appointments.map((appointment) => ({
      ...appointment,
      image: appointment.Patient.user.image,
    }));

    _appointments.forEach((appointment) => {
      delete appointment.Patient;
    });

    APIHelpers.sendAPISuccess(
      res,
      _appointments,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  acceptAppointmentRequest: async (req: Request, res: Response) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.BAD_REQUEST_MSG),
        constants.BAD_REQUEST_CODE
      );
    }
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    await prisma.appointment.update({
      where: {
        id: appointmentId,
        date: {
          gt: date,
        },
      },
      data: {
        status: APPOINTMENT_STATUS.ACCEPTED,
      },
    });

    APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  rejectAppointmentRequest: async (req: Request, res: Response) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.BAD_REQUEST_MSG),
        constants.BAD_REQUEST_CODE
      );
    }
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    await prisma.appointment.update({
      where: {
        id: appointmentId,
        date: {
          gt: date,
        },
      },
      data: {
        status: APPOINTMENT_STATUS.REJECTED,
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
