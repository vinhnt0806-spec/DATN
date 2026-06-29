const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");

router.get("/history",sensorController.getHistory);
router.get("/device-status", (req, res) => {
    res.json(dataStorage.deviceStatus);
});
module.exports = router;