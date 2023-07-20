import Doctor from "../types/doctor";
import Joi from "joi";

export default {
  create: function (doctor: Doctor) {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().email().required(),
      gender: Joi.string().required(),
      password: Joi.string().required(),
      specialization: Joi.string().required(),
      hospital_clinic_name: Joi.string().required(),
      location: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
      }),
    });
    return schema.validate(doctor);
  },
};
