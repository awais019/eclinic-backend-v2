import Joi from "joi";

export default {
  verifyEmail: function (token: string) {
    const schema = Joi.object({
      token: Joi.required(),
    });
    return schema.validate({ token });
  },
};
