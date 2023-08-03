type Patient = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birthdate: Date;
  gender: string;
  password: string;
};

type Appointment = {
  doctorId: string;
  date: Date;
  time: string;
  duration: number;
  charges: number;
  type: string;
};

export { Patient, Appointment };
