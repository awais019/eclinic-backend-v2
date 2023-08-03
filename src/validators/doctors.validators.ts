import { Doctor, DoctorSchedule, Charges } from "../types/doctor";
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
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
    });
    return schema.validate(doctor);
  },
  schedule: function (schedule: DoctorSchedule[]) {
    const schema = Joi.array()
      .items({
        day: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        is_active: Joi.boolean().required(),
        break_start: Joi.string(),
        break_end: Joi.string(),
        appointment_interval: Joi.number().required(),
        buffer: Joi.number().required(),
      })
      .length(7)
      .required();
    return schema.validate(schedule);
  },
  charges: function (charges: Charges[]) {
    const schema = Joi.array()
      .items({
        appointment_type: Joi.string().required(),
        amount: Joi.number().required(),
      })
      .required()
      .min(1);
    return schema.validate(charges);
  },
};
