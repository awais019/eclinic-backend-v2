import express from "express";
import valiadators from "../validators/auth.validators";
import valiateMiddleware from "../middlewares/validate";
import trycatchMiddleware from "../middlewares/trycatch";
import authController from "../controllers/auth.controller";

const router = express.Router();

router.post(
  "/verifyEmail",
  valiateMiddleware(valiadators.verifyEmail),
  trycatchMiddleware(authController.verifyEmail)
);

router.post(
  "/resend/verifyEmail",
  valiateMiddleware(valiadators.verifyEmail),
  trycatchMiddleware(authController.requestNewEmailVerification)
);

export default router;
