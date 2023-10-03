import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import { ROLE, VERIFICATION_STATUS } from "@prisma/client";
import { UploadedFile } from "express-fileupload";
import helpers from "../helpers";
import uploadHelpers from "../helpers/upload";
import cryptoHelpers from "../helpers/crypto";
import jwtHelpers from "../helpers/jwt";
import emailHelpers from "../helpers/email";
import ejsHelpers from "../helpers/ejs";
import dateHelpers from "../helpers/date";
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
          appointment_types_allowed: ["PHYSICAL", "VIRTUAL"],
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

    await prisma.user.update({
      where: {
        id: doctor.userId,
      },
      data: {
        profile_setup: true,
      },
    });

    return helpers.sendAPISuccess(
      res,
      null,
      constants.CREATED_CODE,
      constants.SUCCESS_MSG
    );
  },
  getCharges: async (req: Request, res: Response) => {
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

    const charges = await prisma.charges.findMany({
      where: {
        doctorId: doctor.id,
      },
      select: {
        appointment_type: true,
        amount: true,
      },
    });

    return helpers.sendAPISuccess(
      res,
      charges,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  updateCharges: async (req: Request, res: Response) => {
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
          appointment_types_allowed: ["PHYSICAL", "VIRTUAL"],
        },
      });
    } else {
      await prisma.doctor.update({
        where: {
          id: doctor.id,
        },
        data: {
          appointment_types_allowed: ["PHYSICAL"],
        },
      });
    }

    try {
      await prisma.charges.deleteMany({
        where: {
          doctorId: doctor.id,
        },
      });
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
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getDoctors: async (req: Request, res: Response) => {
    let page = 0;
    let totalPages = 0;
    if (req.query.page) {
      page = parseInt(req.query.page as string);
    }
    let q = "";
    let specialization = "";
    if (req.query.q) {
      q = req.query.q as string;
    }
    if (req.query.specialization) {
      specialization = req.query.specialization as string;
    }
    const skip = page * constants.PAGE_SIZE;

    const doctors = await prisma.$transaction(async () => {
      let doctors = await prisma.doctor.findMany({
        where: {
          specialization: {
            contains: specialization,
            mode: "insensitive",
          },
          verification: VERIFICATION_STATUS.VERIFIED,
          OR: [
            {
              user: {
                first_name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
            {
              user: {
                last_name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
            {
              location: {
                city: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
            {
              location: {
                state: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
      });
      totalPages = Math.ceil(doctors.length / constants.PAGE_SIZE);
      if (page >= totalPages) {
        return [];
      }
      doctors = doctors.slice(skip, skip + constants.PAGE_SIZE);

      if (page === totalPages) {
        doctors = doctors.slice(skip);
      }

      const user = await prisma.user.findMany({
        where: {
          id: {
            in: doctors.map((d) => d.userId),
          },
        },
      });

      const location = await prisma.location.findMany({
        where: {
          id: {
            in: doctors.map((d) => d.locationId),
          },
        },
      });

      const workingHours = await prisma.schedule.findFirst({
        where: {
          doctorId: {
            in: doctors.map((d) => d.id),
          },
        },
      });

      const charges = await prisma.charges.findMany({
        where: {
          doctorId: {
            in: doctors.map((d) => d.id),
          },
        },
      });

      const reviewsCount = await prisma.reviews.count({
        where: {
          doctorId: {
            in: doctors.map((d) => d.id),
          },
        },
      });
      const rating = await prisma.reviews.aggregate({
        where: {
          doctorId: {
            in: doctors.map((d) => d.id),
          },
        },
        _avg: {
          rating: true,
        },
      });

      return [
        ...doctors.map((d) => {
          return {
            ...d,
            first_name: user.find((u) => u.id === d.userId).first_name,
            last_name: user.find((u) => u.id === d.userId).last_name,
            image: user.find((u) => u.id === d.userId).image,
            address: location.find((l) => l.id === d.locationId).address,
            city: location.find((l) => l.id === d.locationId).city,
            state: location.find((l) => l.id === d.locationId).state,
            workingHours: {
              startTime: workingHours.startTime,
              endTime: workingHours.endTime,
            },
            charges: {
              physical: charges.find(
                (c) => c.appointment_type.toUpperCase() === "PHYSICAL"
              ).amount,
              virtual: charges.find(
                (c) => c.appointment_type.toUpperCase() === "VIRTUAL"
              )
                ? charges.find((c) => c.appointment_type === "VIRTUAL").amount
                : null,
            },
            reviewsCount,
            rating: rating._avg.rating,
          };
        }),
      ];
    });

    return helpers.sendAPISuccess(
      res,
      {
        page,
        pageSize: constants.PAGE_SIZE,
        totalPages,
        doctors,
      },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getSpecializations: async (req: Request, res: Response) => {
    const s = await prisma.doctor.findMany({
      select: {
        specialization: true,
      },
      distinct: ["specialization"],
    });

    const specializations = s.map((s) => s.specialization);

    return helpers.sendAPISuccess(
      res,
      {
        specializations,
      },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getDoctor: async (req: Request, res: Response) => {
    const doctorId = req.params.id;

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
        verification: VERIFICATION_STATUS.VERIFIED,
        user: {
          profile_setup: true,
        },
      },
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.NOT_FOUND_MSG),
        constants.NOT_FOUND_CODE
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: doctor.userId,
      },
    });

    const location = await prisma.location.findUnique({
      where: {
        id: doctor.locationId,
      },
    });

    const workingHours = await prisma.schedule.findFirst({
      where: {
        doctorId,
      },
    });

    const charges = await prisma.charges.findMany({
      where: {
        doctorId,
      },
    });

    const reviewsCount = await prisma.reviews.count({
      where: {
        doctorId,
      },
    });
    const rating = await prisma.reviews.aggregate({
      where: {
        doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    return helpers.sendAPISuccess(
      res,
      {
        id: doctor.id,
        userId: doctor.userId,
        first_name: user.first_name,
        last_name: user.last_name,
        specialization: doctor.specialization,
        about: doctor.about,
        image: user.image,
        hospital_clinic_name: doctor.hospital_clinic_name,
        address: location.address,
        city: location.city,
        state: location.state,
        workingHours: {
          startTime: workingHours.startTime,
          endTime: workingHours.endTime,
        },
        charges: {
          physical: charges.find(
            (c) => c.appointment_type.toUpperCase() === "PHYSICAL"
          ).amount,
          virtual: charges.find((c) => c.appointment_type === "VIRTUAL")
            ? charges.find(
                (c) => c.appointment_type.toUpperCase() === "VIRTUAL"
              ).amount
            : null,
        },
        appointment_types_allowed: doctor.appointment_types_allowed,
        reviewsCount,
        rating: Math.round(rating._avg.rating),
      },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getReviews: async (req: Request, res: Response) => {
    let doctorId;

    if (req.params.id != "undefined") {
      doctorId = req.params.id;
    } else if (req.params.id == "undefined") {
      const token = req.header(constants.AUTH_HEADER_NAME);
      const { _id } = jwtHelpers.decode(token) as JwtPayload;
      const doctor = await prisma.doctor.findUnique({
        where: {
          userId: _id,
        },
      });
      doctorId = doctor.id;
    }

    const reviews = await prisma.reviews.findMany({
      where: {
        doctorId,
      },
      select: {
        id: true,
        rating: true,
        review: true,
        date: true,
        patientId: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const patients = await prisma.patient.findMany({
      where: {
        id: {
          in: reviews.map((r) => r.patientId),
        },
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            image: true,
          },
        },
      },
    });

    const data = reviews.map((r) => {
      return {
        id: r.id,
        rating: r.rating,
        review: r.review,
        date: r.date,
        user: {
          firstName: patients.find((p) => p.id === r.patientId).user.first_name,
          lastName: patients.find((p) => p.id === r.patientId).user.last_name,
          image: patients.find((p) => p.id === r.patientId).user.image,
        },
      };
    });

    return helpers.sendAPISuccess(
      res,
      data,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
  getSchedule: async (req: Request, res: Response) => {
    const doctorId = req.params.id;

    const nextTwoWeeks = dateHelpers.getNextTwoWeeks();

    const schedule = await prisma.schedule.findMany({
      where: {
        doctorId,
      },
    });

    nextTwoWeeks.forEach((day) => {
      const s = schedule.find(
        (s) => s.day.toLowerCase() === day.day.toLowerCase()
      );
      if (!s || !s.is_active) {
        day.disable = true;
      }
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          in: nextTwoWeeks.map((d) => d.date),
        },
      },
    });

    nextTwoWeeks.forEach((day) => {
      const a = appointments.filter((a) => a.date === day.date);
      if (a.length >= 10) {
        day.disable = true;
      }
    });

    return helpers.sendAPISuccess(
      res,
      nextTwoWeeks,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },

  getTimeSlots: async (req: Request, res: Response) => {
    const { date, day } = req.body;
    const doctorId = req.params.id;

    const schedule = await prisma.schedule.findFirst({
      where: {
        doctorId,
        day: day.toUpperCase(),
      },
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
      },
    });

    const timeSlots = dateHelpers.getTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.break_start,
      schedule.break_end,
      schedule.appointment_interval
    );

    timeSlots.forEach((slot) => {
      const a = appointments.find((a) => a.time === slot.start);
      if (a) {
        slot.disable = true;
      }
    });

    return res.send(timeSlots);
  },
  getFullSchedule: async (req: Request, res: Response) => {
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

    const schedule = await prisma.schedule.findMany({
      where: {
        doctorId: doctor.id,
      },
      select: {
        is_active: true,
        day: true,
        startTime: true,
        endTime: true,
        break_start: true,
        break_end: true,
        appointment_interval: true,
      },
    });

    return helpers.sendAPISuccess(
      res,
      schedule,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },
};
