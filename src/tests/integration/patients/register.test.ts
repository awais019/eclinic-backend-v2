import request from "supertest";
import server from "../../../index";

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
  it("Should return 401 if input is invalid", () => {
    expect(401).toBe(401);
  });
});
