import Crypto from "crypto-js";

export default {
  encryptPassword: (password: string) => {
    return Crypto.AES.encrypt(
      password,
      process.env.ENCRYPTION_SECRET
    ).toString();
  },
  decryptPassword: (hashedPassword: string) => {
    return Crypto.AES.decrypt(
      hashedPassword,
      process.env.ENCRYPTION_SECRET
    ).toString(Crypto.enc.Utf8);
  },
  comparePassword: (password: string, hashedPassword: string) => {
    return (
      Crypto.AES.decrypt(
        hashedPassword,
        process.env.ENCRYPTION_SECRET
      ).toString(Crypto.enc.Utf8) === password
    );
  },
};
