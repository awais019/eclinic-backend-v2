import { PrismaClient } from "@prisma/client";

class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
  clearDB() {
    return Promise.all([
      this.$queryRaw`TRUNCATE TABLE "User" CASCADE;`,
      this.$queryRaw`TRUNCATE TABLE "Location" CASCADE;`,
    ]);
  }
}

const prisma = new PrismaService();

export default prisma;
