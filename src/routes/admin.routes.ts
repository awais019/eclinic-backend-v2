import express from "express";
import validators from "../validators/auth.validators";
import valiateMiddleware from "../middlewares/validate";
import trycatchMiddleware from "../middlewares/trycatch";
import adminMiddleware from "../middlewares/admin";
import adminController from "../controllers/admin.controller";

const router = express.Router();

router.post("/", trycatchMiddleware(adminController.create));

export default router;
