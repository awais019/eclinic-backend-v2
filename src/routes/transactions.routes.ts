import express from "express";
import authMiddleware from "../middlewares/auth";
import transactions from "../controllers/transactions.controller";
import trycatchMiddleware from "../middlewares/trycatch";

const router = express.Router();

router.get(
  "/",
  authMiddleware(),
  trycatchMiddleware(transactions.getTransactions)
);

export default router;
