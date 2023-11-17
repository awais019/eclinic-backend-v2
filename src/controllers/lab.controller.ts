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
};
