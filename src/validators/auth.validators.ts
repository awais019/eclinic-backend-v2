import Joi from "joi";

export default {
  verifyEmail: function (token: string) {
    const schema = Joi.object({
      token: Joi.required(),
    });
    return schema.validate({ token });
  },
  signin: function (email: string, password: string) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    return schema.validate({ email, password });
  },
};
