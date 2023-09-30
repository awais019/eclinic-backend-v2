import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";
import jwtHelpers from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";

export default {
  create: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const { prescription, appointmentId } = req.body;

    if (!appointmentId || !prescription) {
      return helpers.sendAPIError(
        res,
        new Error(constants.BAD_REQUEST_MSG),
        constants.BAD_REQUEST_CODE
      );
    }

    await prisma.$transaction(async () => {
      await prisma.prescription.create({
        data: {
          appointmentId,
          Medication: {
            createMany: {
              data: prescription,
            },
          },
        },
      });
      await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          completed: true,
        },
      });
    });

    helpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  get: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const doctor = await prisma.patient.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: doctor.id,
        completed: true,
      },
      select: {
        id: true,
      },
    });

    const prescriptions = await prisma.prescription.findMany({
      where: {
        appointmentId: {
          in: appointments.map((appointment) => appointment.id),
        },
      },
      orderBy: {
        Appointment: {
          date: "desc",
        },
      },
      select: {
        id: true,
        Appointment: {
          select: {
            type: true,
            date: true,
            Doctor: {
              select: {
                user: {
                  select: {
                    first_name: true,
                    last_name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        Medication: {
          select: {
            medication: true,
            dosage: true,
            instructions: true,
          },
        },
      },
    });

    helpers.sendAPISuccess(
      res,
      prescriptions.map((prescription) => {
        return {
          id: prescription.id,
          appointment: {
            date: prescription.Appointment.date,
            type: prescription.Appointment.type,
          },
          doctor: {
            first_name: prescription.Appointment.Doctor.user.first_name,
            last_name: prescription.Appointment.Doctor.user.last_name,
            image: prescription.Appointment.Doctor.user.image,
          },
          medication: prescription.Medication,
        };
      }),
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
