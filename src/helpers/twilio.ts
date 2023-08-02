import client from "twilio";
import constants from "../constants";

const twilioClient = client(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default {
  sendCode: (phone: string) => {
    return twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: phone,
        channel: constants.TWILIO_CHANNEL,
      });
  },
  verifyCode: (phone: string, code: string) => {
    return twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: phone,
        code,
      });
  },
};
