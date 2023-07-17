import { Request, Response, NextFunction } from "express";
import helpers from "../helpers";

export default function (validator: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = validator(req.body);
    if (error)
      return helpers.sendAPIError(res, new Error(error.details[0].message));
    next();
  };
}
