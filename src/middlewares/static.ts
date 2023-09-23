import { Request, Response, NextFunction } from "express";

export default function () {
  return function (req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  };
}
