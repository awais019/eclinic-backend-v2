type Doctor = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  gender: string;
  specialization: string;
  hospital_clinic_name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
  };
};

export default Doctor;
