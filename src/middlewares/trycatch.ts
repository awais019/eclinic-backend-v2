import { Request, Response, NextFunction } from "express";
import helpers from "../helpers";

export default function (handler: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      helpers.sendAPIError(res, error);
    }
  };
}
