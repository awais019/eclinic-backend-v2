import request from "supertest";
import server from "../../../index";
import prisma from "../../../prisma";
import constants from "../../../constants";

// 1. Return 400 if no email and password is provided
// 4. Return 401 if email is not registered
// 3. Return 401 if password is incorrect
// 5. Return 403 if email and password is correct and user is not verified
// 6. Return 200 if email and password is correct and user is verified

describe("POST /auth/signin", () => {
  async function createUser() {
    await prisma.patient.create({
      data: {
        birthdate: new Date(),
        user: {
          create: {
            first_name: "John",
            last_name: "Doe",
            email: "john@gmail.com",
            password: "password",
            gender: "MALE",
          },
        },
      },
    });
  }
  beforeEach(async () => {
    server.close();
    await prisma.clearDB();
  });
  afterEach(async () => {
    server.close();
    await prisma.clearDB();
  });

  const validBody = {
    email: "john@gmail.com",
    password: "password",
  };
  let body = {};
  function exec() {
    return request(server).post("/auth/signin").send(body);
  }

  it(`Should return ${constants.BAD_REQUEST_CODE} if input is invalid`, async () => {
    const res = await exec();
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });
});
