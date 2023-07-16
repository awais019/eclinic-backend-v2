import { Request, Response } from "express";

export default {
  create: function (req: Request, res: Response) {
    res.send("Patient created");
  },
};
