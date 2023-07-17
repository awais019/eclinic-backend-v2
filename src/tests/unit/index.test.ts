import request from "supertest";
import server from "../../index";

describe("GET /api", () => {
  afterEach(() => {
    server.close();
  });
  it("Should return 200", async () => {
    const res = await request(server).get("/api");
    expect(res.status).toBe(200);
  });
});
