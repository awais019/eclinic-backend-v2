import express from "express";
import constants from "../constants";

const router = express.Router();

router.post("/register", (req, res) => {
  res.status(constants.BAD_REQUEST_CODE).send("Invalid input");
});

export default router;
