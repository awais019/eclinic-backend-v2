import { Request, Response } from "express";
import APIHelpers from "../helpers";
import constants from "../constants";
// import prisma from "../prisma";

export default {
  create: async function (req: Request, res: Response) {},
};

// bookAppointment: async function (req: Request, res: Response) {
//     const { doctorId, date, time, duration, charges, type } = req.body;

//     const token = req.header(constants.AUTH_HEADER_NAME);

//     const { _id } = jwtHelpers.decode(token) as JwtPayload;

//     const patient = await prisma.patient.findUnique({
//       where: {
//         userId: _id,
//       },
//     });

//     if (!patient) {
//       return helpers.sendAPIError(
//         res,
//         new Error(constants.UNAUTHORIZED_MSG),
//         constants.UNAUTHORIZED_CODE
//       );
//     }

//     const appointmentExists = await prisma.appointment.findFirst({
//       where: {
//         doctorId,
//         date,
//         time,
//       },
//     });

//     if (appointmentExists) {
//       return helpers.sendAPIError(
//         res,
//         new Error(constants.DOCTOR_NOT_AVAILABLE),
//         constants.BAD_REQUEST_CODE
//       );
//     }

//     const appointment = await prisma.appointment.create({
//       data: {
//         doctorId,
//         patientId: _id,
//         date,
//         time,
//         duration,
//         charges,
//         type,
//       },
//     });

//     return helpers.sendAPISuccess(
//       res,
//       appointment,
//       constants.CREATED_CODE,
//       constants.SUCCESS_MSG
//     );
//   },
