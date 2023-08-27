import express from "express";
import validators from "../validators/auth.validators";
import valiateMiddleware from "../middlewares/validate";
import trycatchMiddleware from "../middlewares/trycatch";
import authMiddleware from "../middlewares/auth";
import authController from "../controllers/auth.controller";

const router = express.Router();

router.post(
  "/verifyEmail",
  valiateMiddleware(validators.verifyEmail),
  trycatchMiddleware(authController.verifyEmail)
);

router.post(
  "/resend/verifyEmail",
  valiateMiddleware(validators.verifyEmail),
  trycatchMiddleware(authController.requestNewEmailVerification)
);

router.post(
  "/sendUpdateEmail",
  authMiddleware(),
  trycatchMiddleware(authController.sendUpdateEmail)
);

router.post(
  "/signin",
  valiateMiddleware(validators.signin),
  trycatchMiddleware(authController.signin)
);

router.post(
  "/forgotpassword",
  valiateMiddleware(validators.forgotPassword),
  trycatchMiddleware(authController.forgotPassword)
);

router.post(
  "/resetpassword",
  valiateMiddleware(validators.resetPassword),
  trycatchMiddleware(authController.resetPassword)
);

router.post(
  "/updatepassword",
  authMiddleware(),
  trycatchMiddleware(authController.updatePassword)
);

router.post(
  "/uploadimage",
  authMiddleware(),
  trycatchMiddleware(authController.uploadImage)
);

router.get("/me", authMiddleware(), trycatchMiddleware(authController.me));

router.put(
  "/me",
  authMiddleware(),
  trycatchMiddleware(authController.updateInfo)
);

router.post(
  "/send/phonecode",
  [valiateMiddleware(validators.sendPhoneCode), authMiddleware()],
  trycatchMiddleware(authController.sendPhoneCode)
);

router.post(
  "/verify/phonecode",
  [valiateMiddleware(validators.verifyPhoneCode), authMiddleware()],
  trycatchMiddleware(authController.verifyPhoneCode)
);

export default router;
