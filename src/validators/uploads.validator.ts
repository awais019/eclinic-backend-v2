import Joi from "joi";

export default {
  upload: function (file: any) {
    const schema = Joi.object({
      doctorId: Joi.string().required(),
    });
    return schema.validate(file);
  },
};
