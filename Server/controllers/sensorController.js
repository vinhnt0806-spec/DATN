const Sensor = require("../models/Sensor");

// Biến lưu mốc thời gian lần cuối cùng ghi vào Database
let lastSaveTime = 0; 
const SAVE_INTERVAL = 1 * 60 * 1000; // 1 phút

// 1. HÀM XỬ LÝ LƯU DỮ LIỆU (Sẽ gọi từ file Server chính có chứa WebSocket)
const handleSaveSensor = async (doc) => {
    try {
        const now = Date.now();
        if (now - lastSaveTime >= SAVE_INTERVAL) {
            lastSaveTime = now; // Cập nhật lại mốc thời gian
            
            // Lưu vào MongoDB
            await Sensor.create({
                nhietdo: doc.nhietdo,
                doamkk: doc.doamkk,
                doamdat: doc.doamdat,
                anhsang: doc.anhsang
            });
            console.log(`💾 Đã lưu lịch sử cảm biến vào Database lúc ${new Date().toLocaleTimeString()}`);
        }
    } catch (error) {
        console.error("❌ Lỗi khi lưu dữ liệu cảm biến vào DB:", error);
    }
};

// 2. HÀM LẤY DỮ LIỆU LỊCH SỬ (Dùng cho Route HTTP GET hiện lên Web)
const getHistory = async (req, res) => {
    try {
        // Tìm trong Database, sắp xếp mới nhất lên đầu và giới hạn 20 bản ghi
        const historyData = await Sensor.find()
            .sort({ _id: -1 }) 

        // Đảo ngược mảng để dữ liệu sắp xếp từ Cũ -> Mới nhằm vẽ biểu đồ đúng hướng
        return res.json(historyData.reverse());
    } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu lịch sử từ DB:", error);
        return res.status(500).json({ error: "Lỗi Server nội bộ" });
    }
};

// Export cả 2 hàm ra ngoài để các file khác sử dụng
module.exports = {getHistory,handleSaveSensor};


// const Sensor = require("../models/Sensor");
// const SystemConfig = require("../models/systemConfig");
// const dataStorage = require("../data/storage");

// let lastSaveTime = 0;

// exports.updateSensor = async (req, res) => {
//     console.log("ESP32:", req.body);
//     if (req.body.nhietdo !== undefined)
//         dataStorage.sensorData.nhietdo = req.body.nhietdo;

//     if (req.body.doamkk !== undefined)
//         dataStorage.sensorData.doamkk = req.body.doamkk;

//     if (req.body.doamdat !== undefined)
//         dataStorage.sensorData.doamdat = req.body.doamdat;

//     if (req.body.anhsang !== undefined)
//         dataStorage.sensorData.anhsang = req.body.anhsang;

//     try {
//         const now = Date.now();
//         if (now - lastSaveTime >= 5000) {
//             await Sensor.create({
//                 nhietdo: req.body.nhietdo,
//                 doamkk: req.body.doamkk,
//                 doamdat: req.body.doamdat,
//                 anhsang: req.body.anhsang
//             });
//             lastSaveTime = now;
//             console.log("Đã lưu MongoDB");
//         }
//     } catch (err) {
//         console.log("Lỗi lưu MongoDB:", err);
//     }
//     res.json({ status: "success" });
// };

// exports.getData = (req, res) => {
//     res.json(dataStorage);
// };

// exports.getHistory = async (req, res) => {
//     try {
//         const history = await Sensor.find()
//             .sort({ created_at: -1 })
//             .limit(50);
//         res.json(history);
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// // // Tự động chạy khi server bật lên để lấy ngưỡng từ MongoDB nạp vào RAM (dataStorage)
// // const loadThresholdsFromDB = async () => {
// //     try {
// //         let config = await SystemConfig.findOne({ configId: "main_config" });
// //         if (!config) {
// //             // Nếu lần đầu tiên chạy chưa có dữ liệu trong DB, tự tạo mới 1 bản ghi mặc định
// //             config = await SystemConfig.create({ configId: "main_config" });
// //         }
// //         // Gán ngược các ngưỡng từ DB vào dataStorage để App/Web có cái đọc luôn
// //         dataStorage.thresholds = config.thresholds;
// //         console.log("=== Đã đồng bộ các ngưỡng từ MongoDB vào RAM ===");
// //     } catch (err) {
// //         console.log("Lỗi nạp ngưỡng từ MongoDB:", err);
// //     }
// // };
// // loadThresholdsFromDB();

// // // API xử lý lưu ngưỡng (POST /thresholds)
// // exports.updateThresholds = async (req, res) => {
// //     try {
// //         const incomingData = req.body; // Dữ liệu nhận về, ví dụ: { tempLower: 25 }
// //         const key = Object.keys(incomingData)[0]; // Lấy ra tên biến (Ví dụ: 'tempLower')
// //         const value = incomingData[key];          // Lấy ra giá trị (Ví dụ: 25)

// //         if (key && value !== undefined) {
// //             // 1. Cập nhật ngay lập tức vào RAM (dataStorage) để bên còn lại fetch được luôn
// //             if (!dataStorage.thresholds) dataStorage.thresholds = {};
// //             dataStorage.thresholds[key] = value;

// //             // 2. Ghi đè vào MongoDB để lưu trữ vĩnh viễn
// //             await SystemConfig.updateOne(
// //                 { configId: "main_config" },
// //                 { $set: { [`thresholds.${key}`]: value } }
// //             );
// //             console.log(`Đã lưu ngưỡng [${key} = ${value}] thành công!`);
// //         }
// //         res.json({ status: "success" });
// //     } catch (err) {
// //         console.error("Lỗi cập nhật ngưỡng:", err);
// //         res.status(500).json({ error: err.message });
// //     }
// // };