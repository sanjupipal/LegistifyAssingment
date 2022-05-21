const express = require("express");
const router = express.Router();
const { parkingEntry, parkingExit, get, parkingHistory } = require("./service");

router.get("/", get);
router.get("/history", parkingHistory);
router.post("/entry", parkingEntry);
router.post("/exit", parkingExit);

module.exports = router;
