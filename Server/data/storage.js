const SystemConfig = require("../models/systemConfig");

// KHO LƯU TRỮ TẠM THỜI (RAM SERVER)
const dataStorage = {
    mode: 0,
    sensorData: { nhietdo: 0, doamkk: 0, doamdat: 0, anhsang: 0 },
    control: { bom: 0, phunsuong: 0, den: 0, quat: 0, manche: 0 },
    thresholds: {
        temperatureUpper: 0, temperatureLower: 0,
        humidityUpper: 0, humidityLower: 0,
        soilMoistureUpper: 0, soilMoistureLower: 0,
        lightIntensityUpper: 0, lightIntensityLower: 0
    },
    deviceStatus: {
        online: false,
        lastSeen: null
    }
};

async function initMemoryStore() {
    try {
        let config = await SystemConfig.findOne({ configId: "main_config" });
        if (!config) {
            config = await SystemConfig.create({
                configId: "main_config",
                mode: 0,
                thresholds: {
                    temperatureUpper: 0, temperatureLower: 0,
                    humidityUpper: 0, humidityLower: 0,
                    soilMoistureUpper: 0, soilMoistureLower: 0,
                    lightIntensityUpper: 0, lightIntensityLower: 0
                }
            });
        }
        dataStorage.mode = config.mode || 0;
        if (config.thresholds) dataStorage.thresholds = config.thresholds;
        console.log("🔄 Đã nạp cấu hình cũ từ Database vào RAM");
    } catch (err) {
        console.log("❌ Lỗi nạp cấu hình vào RAM:", err);
    }
}

module.exports = { dataStorage, initMemoryStore };