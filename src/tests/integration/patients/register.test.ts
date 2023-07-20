import request from "supertest";
import prisma from "../../../prisma";
import server from "../../../index";
import constants from "../../../constants";

// return 400 if invalid data is provided
// return 400 if email is already in use
// hash the password before saving it to the database
// return 201 if valid data is provided
// save the patient to the database
// return the patient if valid data is provided

describe("POST /api/patients/register", () => {
  afterEach(async () => {
    server.close();
    await prisma.patient.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });
  let body = {};
  const validBody = {
    first_name: "John",
    last_name: "Doe",
    email: "john@gmail.com",
    password: "123456789",
    gender: "male",
    birthdate: new Date(),
  };

  function exec() {
    return request(server).post("/api/patients/register").send(body);
  }

  it(`Should return ${constants.BAD_REQUEST_CODE} if input is invalid`, async () => {
    const res = await exec();
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });

  it(`Should return ${constants.BAD_REQUEST_CODE} if email is already in use`, async () => {
    await prisma.patient.create({
      data: {
        birthdate: new Date(),
        user: {
          create: {
            first_name: "John",
            last_name: "Doe",
            email: "john@gmail.com",
            gender: "MALE",
            password: "123456789",
          },
        },
      },
    });
    body = validBody;
    const res = await exec();
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });

  it(`Should return ${constants.CREATED_CODE} if valid data is provided`, async () => {
    body = validBody;
    const res = await exec();
    expect(res.status).toBe(constants.CREATED_CODE);
  });

  it(`Should save the patient to the database`, async () => {
    body = validBody;
    const res = await exec();
    const patientInDB = await prisma.patient.findUnique({
      where: { id: res.body.id },
    });
    expect(patientInDB.id).toBe(res.body.id);
  });

  it(`Should return the patient if valid data is provided`, async () => {
    body = validBody;
    const res = await exec();
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("birthdate");
    expect(res.body).toHaveProperty("first_name");
    expect(res.body).toHaveProperty("last_name");
    expect(res.body).toHaveProperty("email");
  });
});
