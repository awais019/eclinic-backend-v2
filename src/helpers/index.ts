import { Response } from "express";
import constants from "../constants";

export default {
  sendAPIError: function (
    res: Response,
    error: Error,
    code = constants.BAD_REQUEST_CODE
  ) {
    return res.status(code).send(error.message);
  },
  sendAPISuccess: function <T>(
    res: Response,
    data: T,
    code = constants.SUCCESS_CODE
  ) {
    return res.status(code).send(data);
  },
};
