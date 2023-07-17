import Patient from "../types/patient";
import Joi from "joi";

export default {
  create: function (patient: Patient) {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      birthdate: Joi.date().required(),
      password: Joi.string().required(),
    });
    return schema.validate(patient);
  },
};
