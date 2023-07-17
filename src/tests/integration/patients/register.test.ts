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
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });
  it(`Should return ${constants.BAD_REQUEST_CODE} if input is invalid`, async () => {
    const res = await request(server).post("/api/patients/register").send({});
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });

  it(`Should return ${constants.BAD_REQUEST_CODE} if email is already in use`, async () => {
    const user = {
      first_name: "John",
      last_name: "Doe",
      email: "john@gmail.com",
      password: "123456789",
    };
    const patient = await prisma.patient.create({
      data: {
        birthdate: new Date(),
        user: {
          create: user,
        },
      },
    });
    const res = await request(server)
      .post("/api/patients/register")
      .send({
        ...user,
        birthdate: new Date(),
      });
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });

  it(`Should return ${constants.CREATED_CODE} if valid data is provided`, async () => {
    const patient = {
      first_name: "John",
      last_name: "Doe",
      email: "john@gmail.com",
      password: "123456789",
      birthdate: new Date(),
    };
    const res = await request(server)
      .post("/api/patients/register")
      .send(patient);
    expect(res.status).toBe(constants.CREATED_CODE);
  });

  it(`Should save the patient to the database`, async () => {
    const patient = {
      first_name: "John",
      last_name: "Doe",
      email: "john@gmail.com",
      password: "123456789",
      birthdate: new Date(),
    };
    const res = await request(server)
      .post("/api/patients/register")
      .send(patient);
    const patientInDB = await prisma.patient.findUnique({
      where: { id: res.body.id },
    });
    expect(patientInDB.id).toBe(res.body.id);
  });

  it(`Should return the patient if valid data is provided`, async () => {
    const patient = {
      first_name: "John",
      last_name: "Doe",
      email: "john@gmail.com",
      password: "123456789",
      birthdate: new Date(),
    };
    const res = await request(server)
      .post("/api/patients/register")
      .send(patient);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("birthdate");
    expect(res.body).toHaveProperty("first_name");
    expect(res.body).toHaveProperty("last_name");
    expect(res.body).toHaveProperty("email");
  });
});
