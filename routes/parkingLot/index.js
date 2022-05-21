const express = require("express");
const router = express.Router();
const { createOrUpdate,get } = require("./service");

router.get("/",get)
router.post("/",createOrUpdate)


module.exports = router;
