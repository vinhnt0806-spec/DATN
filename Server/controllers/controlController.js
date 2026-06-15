const dataStorage = require("../data/storage");

exports.updateControl = (req, res) => {
    console.log("===== CONTROL UPDATE =====");
    console.log(req.body);

    if (req.body.bom !== undefined) {
        dataStorage.control.bom = req.body.bom;
        console.log("Bơm:", req.body.bom);
    }

    if (req.body.phunsuong !== undefined) {
        dataStorage.control.phunsuong = req.body.phunsuong;
        console.log("Phun sương:", req.body.phunsuong);
    }

    if (req.body.den !== undefined) {
        dataStorage.control.den = req.body.den;
        console.log("Đèn:", req.body.den);
    }

    if (req.body.quat !== undefined) {
        dataStorage.control.quat = req.body.quat;
        console.log("Quạt:", req.body.quat);
    }

    if (req.body.manche !== undefined) {
        dataStorage.control.manche = req.body.manche;
        console.log("Màn che:", req.body.manche);
    }

    if (req.body.mode !== undefined) {
        dataStorage.system.mode = req.body.mode;
        console.log("Mode:", req.body.mode);
    }

    res.json({ status: "success" });
};

exports.updateThresholds = (req, res) => {

    // NHIỆT ĐỘ
    if (req.body.temperatureUpper !== undefined)
        dataStorage.thresholds.temperatureUpper = req.body.temperatureUpper;

    if (req.body.temperatureLower !== undefined)
        dataStorage.thresholds.temperatureLower = req.body.temperatureLower;

    // ĐỘ ẨM KHÔNG KHÍ
    if (req.body.humidityUpper !== undefined)
        dataStorage.thresholds.humidityUpper = req.body.humidityUpper;

    if (req.body.humidityLower !== undefined)
        dataStorage.thresholds.humidityLower = req.body.humidityLower;

    // ĐỘ ẨM ĐẤT
    if (req.body.soilMoistureUpper !== undefined)
        dataStorage.thresholds.soilMoistureUpper = req.body.soilMoistureUpper;

    if (req.body.soilMoistureLower !== undefined)
        dataStorage.thresholds.soilMoistureLower = req.body.soilMoistureLower;

    // ÁNH SÁNG
    if (req.body.lightIntensityUpper !== undefined)
        dataStorage.thresholds.lightIntensityUpper = req.body.lightIntensityUpper;

    if (req.body.lightIntensityLower !== undefined)
        dataStorage.thresholds.lightIntensityLower = req.body.lightIntensityLower;

    res.json({ status: "success" });
};