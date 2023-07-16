import { Request, Response } from "express";
import constants from "../constants";

export default (req: Request, res: Response) => {
  res.status(constants.SUCCESS_CODE).send("Server is up and running!");
};
