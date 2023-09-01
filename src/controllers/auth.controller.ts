import { Request, Response } from "express";
import prisma from "../prisma";
import { JwtPayload } from "jsonwebtoken";
import constants from "../constants";
import jwtHelpers from "../helpers/jwt";
import cryptoHelpers from "../helpers/crypto";
import APIHelpers from "../helpers";
import ejsHelpers from "../helpers/ejs";
import emailHelpers from "../helpers/email";
import uploadHelpers from "../helpers/upload";
import twilioHelpers from "../helpers/twilio";
import { UploadedFile } from "express-fileupload";
import { ROLE, VERIFICATION_STATUS } from "@prisma/client";

export default {
  verifyEmail: async function (req: Request, res: Response) {
    const { token } = req.body;
    try {
      jwtHelpers.verify(token);
    } catch (error) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.INVALID_TOKEN),
        constants.BAD_REQUEST_CODE
      );
    }

    const { _id, email } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    if (email) {
      await prisma.user.update({
        where: { id: _id },
        data: { email, email_verified: true },
      });
      return APIHelpers.sendAPISuccess(
        res,
        email,
        constants.SUCCESS_CODE,
        constants.EMAIL_VERIFIED
      );
    }

    if (user.email_verified) {
      return APIHelpers.sendAPISuccess(
        res,
        null,
        constants.SUCCESS_CODE,
        constants.EMAIL_ALREADY_VERIFIED
      );
    }

    await prisma.user.update({
      where: { id: _id },
      data: { email_verified: true },
    });
    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.EMAIL_VERIFIED
    );
  },
  requestNewEmailVerification: async function (req: Request, res: Response) {
    const { token } = req.body;
    try {
      jwtHelpers.verify(token, {
        ignoreExpiration: true,
      });
    } catch (error) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.INVALID_TOKEN),
        constants.BAD_REQUEST_CODE
      );
    }

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    if (user.email_verified) {
      return APIHelpers.sendAPISuccess(
        res,
        null,
        constants.SUCCESS_CODE,
        constants.EMAIL_ALREADY_VERIFIED
      );
    }

    const newToken = jwtHelpers.sign({ _id, email: user.email });

    const html = await ejsHelpers.renderHTMLFile("email", {
      name: user.first_name,
      link: `${process.env.CLIENT_URL}/?token=${newToken}`,
    });

    await emailHelpers.sendMail(
      user.email,
      "Welcome to Eclinic",
      null,
      null,
      html
    );

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.VERIFICATION_EMAIL_SENT
    );
  },

  sendUpdateEmail: async function (req: Request, res: Response) {
    const { email } = req.body;
    const token = req.header(constants.AUTH_HEADER_NAME);
    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    if (user.email == email) {
      return APIHelpers.sendAPISuccess(
        res,
        null,
        constants.SUCCESS_CODE,
        constants.EMAIL_ALREADY_VERIFIED
      );
    }

    const newToken = jwtHelpers.sign({ _id, email });

    const html = await ejsHelpers.renderHTMLFile("email", {
      name: user.first_name,
      link: `${process.env.CLIENT_URL}/?token=${newToken}`,
    });

    await emailHelpers.sendMail(email, "Welcome to Eclinic", null, null, html);

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.VERIFICATION_EMAIL_SENT
    );
  },

  signin: async function (req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Invalid credentials."),
        constants.UNAUTHORIZED_CODE
      );
    }

    let isPasswordValid;

    if (process.env.NODE_ENV === "test") {
      isPasswordValid = password === user.password;
    } else {
      isPasswordValid = cryptoHelpers.comparePassword(password, user.password);
    }

    if (!isPasswordValid) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Invalid credentials."),
        constants.UNAUTHORIZED_CODE
      );
    }

    if (!user.email_verified) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Email not verified."),
        constants.FORBIDDEN_CODE
      );
    }

    if (user.role == ROLE.DOCTOR) {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      if (
        doctor.verification == VERIFICATION_STATUS.PENDING ||
        doctor.verification == VERIFICATION_STATUS.REJECTED
      ) {
        return APIHelpers.sendAPIError(
          res,
          new Error(constants.ACCOUNT_NOT_APPROVED),
          constants.FORBIDDEN_CODE
        );
      }
    }

    const token = jwtHelpers.sign({ _id: user.id, email: user.email });

    return APIHelpers.sendAPISuccess(
      res,
      { token },
      constants.SUCCESS_CODE,
      constants.LOGIN_SUCCESS
    );
  },
  forgotPassword: async function (req: Request, res: Response) {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.USER_NOT_FOUND),
        constants.NOT_FOUND_CODE
      );
    }

    const token = jwtHelpers.sign({ _id: user.id, email: user.email });

    const html = await ejsHelpers.renderHTMLFile("resetpassword", {
      name: user.first_name,
      link: `${process.env.CLIENT_URL}/forgotpassword/resetpassword?token=${token}`,
    });

    await emailHelpers.sendMail(user.email, "Reset password", null, null, html);

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.RESET_PASSWORD_EMAIL_SENT
    );
  },
  resetPassword: async function (req: Request, res: Response) {
    const { token, password } = req.body;

    try {
      jwtHelpers.verify(token);
    } catch (error) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.INVALID_TOKEN),
        constants.BAD_REQUEST_CODE
      );
    }

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    const hashedPassword = cryptoHelpers.encryptPassword(password);

    await prisma.user.update({
      where: { id: _id },
      data: { password: hashedPassword },
    });

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.PASSWORD_RESET_SUCCESS
    );
  },

  updatePassword: async function (req: Request, res: Response) {
    const { current_password, new_password } = req.body;
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    let isPasswordValid;

    if (process.env.NODE_ENV === "test") {
      isPasswordValid = current_password === user.password;
    } else {
      isPasswordValid = cryptoHelpers.comparePassword(
        current_password,
        user.password
      );
    }

    if (!isPasswordValid) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.INVALID_PASSWORD),
        constants.BAD_REQUEST_CODE
      );
    }

    let hashedPassword;

    if (process.env.NODE_ENV === "test") {
      hashedPassword = new_password;
    } else {
      hashedPassword = cryptoHelpers.encryptPassword(new_password);
    }

    await prisma.user.update({
      where: { id: _id },
      data: { password: hashedPassword },
    });

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },

  uploadImage: async function (req: Request, res: Response) {
    if (!req.files) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.FILE_NOT_UPLOADED),
        constants.BAD_REQUEST_CODE
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
    const imageName = await uploadHelpers.uploadFile(
      file,
      constants.IMAGES_FOLDER
    );

    const token = req.header(constants.AUTH_HEADER_NAME);
    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    await prisma.user.update({
      where: { id: _id },
      data: { image: imageName },
    });

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.IMAGE_UPLOADED
    );
  },
  me: async function (req: Request, res: Response) {
    const token = req.header(constants.AUTH_HEADER_NAME);
    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        gender: true,
        role: true,
        image: true,
        profile_setup: true,
      },
    });

    let additionalData = {};

    if (user.role == ROLE.PATIENT) {
      additionalData = await prisma.patient.findUnique({
        where: { userId: user.id },
        select: {
          birthdate: true,
        },
      });
    } else if (user.role == ROLE.DOCTOR) {
      const moreDate = await prisma.doctor.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          hospital_clinic_name: true,
          specialization: true,
          location: {
            select: {
              address: true,
              city: true,
              state: true,
            },
          },
          schedule: true,
        },
      });
      const rating = await prisma.reviews.aggregate({
        where: { doctorId: moreDate.id },
        _avg: {
          rating: true,
        },
      });

      additionalData = {
        hospital_clinic_name: moreDate.hospital_clinic_name,
        specialization: moreDate.specialization,
        schedule: moreDate.schedule,
        address: moreDate.location.address,
        city: moreDate.location.city,
        state: moreDate.location.state,
        rating: rating._avg.rating,
      };
    }

    return APIHelpers.sendAPISuccess(
      res,
      { ...user, ...additionalData },
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },

  updateInfo: async (req: Request, res: Response) => {
    const { first_name, last_name, gender, specialization, birthdate } =
      req.body;

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    if (user.role == ROLE.PATIENT) {
      await prisma.patient.update({
        where: { userId: _id },
        data: { birthdate },
      });
    } else if (user.role == ROLE.DOCTOR) {
      await prisma.doctor.update({
        where: { userId: _id },
        data: { specialization },
      });
    }

    await prisma.user.update({
      where: { id: _id },
      data: {
        first_name,
        last_name,
        gender,
      },
    });

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },

  updateHospitalInfo: async (req: Request, res: Response) => {
    const { hospital_clinic_name, address, city, state } = req.body;

    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    await prisma.doctor.update({
      where: { userId: _id },
      data: {
        hospital_clinic_name,
        location: {
          update: {
            address,
            city,
            state,
          },
        },
      },
    });

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.SUCCESS_MSG
    );
  },

  sendPhoneCode: async function (req: Request, res: Response) {
    const { phone } = req.body;

    await twilioHelpers.sendCode(phone);

    return APIHelpers.sendAPISuccess(
      res,
      {
        phone,
      },
      constants.SUCCESS_CODE,
      constants.VERIFICATION_CODE_SENT
    );
  },
  verifyPhoneCode: async (req: Request, res: Response) => {
    const { phone, code } = req.body;

    const { _id } = jwtHelpers.decode(
      req.header(constants.AUTH_HEADER_NAME)
    ) as JwtPayload;

    const verificationCheck = await twilioHelpers.verifyCode(phone, code);

    if (!verificationCheck.valid) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.INVALID_CODE),
        constants.BAD_REQUEST_CODE
      );
    }

    await prisma.user.update({
      where: { id: _id },
      data: { phone_verified: true, phone },
    });

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.PHONE_VERIFIED
    );
  },
};
