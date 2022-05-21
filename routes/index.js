const express = require("express");
const router = express.Router();

const parking = require("./parking");
router.use("/parking", parking);

const parkingLot = require("./parkingLot");
router.use("/parkingLot", parkingLot);

const vehicleType = require("./vehicleType");
router.use("/vehicleType", vehicleType);

module.exports = router;
