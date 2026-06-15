const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema({
    // Dùng 1 ID cố định để luôn ghi đè vào đúng 1 bản ghi này trong DB
    configId: { type: String, default: "main_config", unique: true },
    
    // ✅ THÊM TRƯỜNG MODE: Lưu trạng thái AUTO (0) hoặc MANUAL (1) độc lập
    mode: { type: Number, default: 0 },
    
    // Đã đồng bộ chuẩn tên biến với dataStorage ở Server và Webapp
    thresholds: {
        temperatureUpper: { type: Number, default: 0 },
        temperatureLower: { type: Number, default: 0 },
        humidityUpper:   { type: Number, default: 0 },
        humidityLower:   { type: Number, default: 0 },
        soilMoistureUpper: { type: Number, default: 0 },
        soilMoistureLower: { type: Number, default: 0 },
        lightIntensityUpper: { type: Number, default: 0 },
        lightIntensityLower: { type: Number, default: 0 }
    }
});

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
module.exports = SystemConfig;

// const mongoose = require("mongoose");

// const systemConfigSchema = new mongoose.Schema({
//     // Dùng 1 ID cố định để luôn ghi đè vào đúng 1 dòng này trong DB
//     configId: { type: String, default: "main_config", unique: true },
    
//     // Chỉ lưu các ngưỡng tự động
//     thresholds: {
//         tempLower: { type: Number, default: 0 },
//         tempUpper: { type: Number, default: 0 },
//         humLower: { type: Number, default: 0 },
//         humUpper: { type: Number, default: 0 },
//         soilLower: { type: Number, default: 0 },
//         soilUpper: { type: Number, default: 0 },
//         lightLower: { type: Number, default: 0 },
//         lightUpper: { type: Number, default: 0 }
//     }
// });

// const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
// module.exports = SystemConfig;