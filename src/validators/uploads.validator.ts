import Joi from "joi";

export default {
  upload: function (file: any) {
    const schema = Joi.object({
      doctorId: Joi.string().required(),
      type: Joi.string(),
    });
    return schema.validate(file);
  },
};
