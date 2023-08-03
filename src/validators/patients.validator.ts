import { Patient, Appointment } from "../types/patient";
import Joi from "joi";

export default {
  create: function (patient: Patient) {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().email().required(),
      gender: Joi.string().required(),
      birthdate: Joi.date().required(),
      password: Joi.string().required(),
    });
    return schema.validate(patient);
  },
  bookAppointment: function (appointment: Appointment) {
    const schema = Joi.object({
      doctorId: Joi.string().required(),
      date: Joi.date().required(),
      time: Joi.string().required(),
      duration: Joi.number().required(),
      charges: Joi.number().required(),
      type: Joi.string().required(),
    });
    return schema.validate(appointment);
  },
};
