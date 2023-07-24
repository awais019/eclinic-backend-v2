import { createTransport } from "nodemailer";
import logger from "../startup/logger";

export default {
  sendMail: async (
    to: string | string[],
    subject: string,
    text: string | null,
    attachments: any[] | null = null,
    html: string | null = null
  ) => {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let mailOptions: {
      from: string;
      to: string | string[];
      subject: string;
      text?: string;
      html?: string;
      attachments?: any[];
    } = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    };
    if (html) {
      delete mailOptions.text;
      mailOptions.html = html;
    }
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    return transporter.sendMail(mailOptions, (error, info) => {
      if (info) {
        logger.info(info);
      } else if (error) {
        logger.error(error);
      }
    });
  },
};
