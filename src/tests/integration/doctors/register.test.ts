import request from "supertest";
import server from "../../../index";
import prisma from "../../../prisma";
import constants from "../../../constants";

// test1: should return 400 if input is invalid
// test2: should return 201 if input is valid
// test3: should create a new doctor in the database
// test4: should return 400 if email is already registered
// test5: should return doctor if input is valid

describe("POST /api/doctors/register", () => {
  afterEach(async () => {
    server.close();
    await prisma.patient.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.$disconnect();
  });
  let body = {};
  const validBody = {
    first_name: "John",
    last_name: "Doe",
    email: "john@gmail.com",
    password: "123456789",
    gender: "male",
    specialization: "specialization",
    hospital_clinic_name: "hospital_clinic_name",
    location: {
      latitude: 0,
      longitude: 0,
      address: "address",
      city: "Cairo",
      state: "Cairo",
    },
  };
  function exec() {
    return request(server).post("/api/doctors/register").send(body);
  }

  it(`Should return ${constants.BAD_REQUEST_CODE} if input is invalid`, async () => {
    const res = await exec();
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });

  it(`Should return ${constants.CREATED_CODE} if input is valid`, async () => {
    body = validBody;
    const res = await exec();
    expect(res.status).toBe(constants.CREATED_CODE);
  });

  it("Should create a new doctor in the database", async () => {
    body = validBody;
    await exec();
    const user = await prisma.user.findUnique({
      where: { email: validBody.email },
    });
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });
    expect(doctor).toHaveProperty("specialization", validBody.specialization);
  });

  it("Should add ROLE DOCTOR to the user", async () => {
    body = validBody;
    await exec();
    const user = await prisma.user.findUnique({
      where: { email: validBody.email },
    });
    expect(user).toHaveProperty("role", "DOCTOR");
  });

  it(`Should return ${constants.BAD_REQUEST_CODE}  if email is already registered`, async () => {
    body = validBody;
    await exec();
    const res = await exec();
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });

  it(`Should return ${constants.SUCCESS_MSG} msg if input is valid`, async () => {
    body = validBody;
    const res = await exec();
    expect(res.body).toHaveProperty("message", constants.SUCCESS_MSG);
  });
});
