import { Request, Response } from "express";
import helpers from "../helpers";

export default (req: Request, res: Response) => {
  helpers.sendAPISuccess(res, "Server is up and Running!");
};
