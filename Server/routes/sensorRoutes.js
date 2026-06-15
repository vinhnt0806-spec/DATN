const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");

// router.post("/update-sensor",sensorController.updateSensor);

// router.get("/data",sensorController.getData);

router.get("/history",sensorController.getHistory);

// router.post('/thresholds',sensorController.updateThresholds);

module.exports = router;