import { Request, Response, NextFunction } from "express";
import constants from "../constants";

export default function (validator: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = validator(req.body);
    if (error) return res.status(constants.BAD_REQUEST_CODE).send(error.details[0].message);
    next();
  };
}
