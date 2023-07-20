import request from "supertest";
import server from "../../../index";

// test1: should return 400 if input is invalid
// test2: should return 201 if input is valid
// test3: should create a new doctor in the database
// test4: should return 400 if email is already registered
// test5: should return doctor if input is valid

describe("POST /api/doctors/register", () => {
  afterEach(() => {
    server.close();
  });
  let body = {};
  const validBody = {
    first_name: "John",
    last_name: "Doe",
    email: "john@gmail.com",
    password: "123456789",
    gender: "male",
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

  it("Should return 400 if input is invalid", async () => {
    const res = await exec();
    expect(res.status).toBe(400);
  });
});
