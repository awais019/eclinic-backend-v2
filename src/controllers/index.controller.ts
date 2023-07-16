import { Request, Response } from "express";

export default (req: Request, res: Response) => {
  res.send("Server is up and running!");
};
