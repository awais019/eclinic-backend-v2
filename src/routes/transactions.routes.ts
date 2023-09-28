import express from "express";
import authMiddleware from "../middlewares/auth";
import transactions from "../controllers/transactions.controller";
import trycatchMiddleware from "../middlewares/trycatch";

const router = express.Router();

router.get(
  "/doctor",
  authMiddleware(),
  trycatchMiddleware(transactions.getDoctorTransactions)
);

router.get(
  "/patient",
  authMiddleware(),
  trycatchMiddleware(transactions.getPatientTransactions)
);

export default router;
