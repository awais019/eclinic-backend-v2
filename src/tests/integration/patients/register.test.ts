import request from "supertest";
import server from "../../../index";
import constants from "../../../constants";

// return 400 if invalid data is provided
// return 400 if email is already in use
// hash the password before saving it to the database
// return 201 if valid data is provided
// save the patient to the database
// return the patient if valid data is provided

describe("POST /api/patients/register", () => {
  afterEach(() => {
    server.close();
  });
  it(`Should return ${constants.BAD_REQUEST_CODE} if input is invalid`, async () => {
    const res = await request(server).post("/api/patients/register").send({});
    expect(res.status).toBe(constants.BAD_REQUEST_CODE);
  });
});
