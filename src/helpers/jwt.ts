import jwt from "jsonwebtoken";

export default {
  sign: (payload: jwt.JwtPayload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });
  },
  verify: (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
  decode: (token: string) => {
    return jwt.decode(token);
  },
};
