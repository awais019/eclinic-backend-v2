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
    data: T | null,
    code = constants.SUCCESS_CODE,
    message = ""
  ) {
    if (message && !data) {
      return res.status(code).send({ message });
    } else if (!message) {
      return res.status(code).send(data);
    }
    return res.status(code).send({ message, data });
  },
};
