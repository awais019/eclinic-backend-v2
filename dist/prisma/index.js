"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class PrismaService extends client_1.PrismaClient {
    constructor() {
        super();
    }
    clearDB() {
        return Promise.all([
            this.$queryRaw `TRUNCATE TABLE "User" CASCADE;`,
            this.$queryRaw `TRUNCATE TABLE "Location" CASCADE;`,
        ]);
    }
}
const prisma = new PrismaService();
exports.default = prisma;
//# sourceMappingURL=index.js.map