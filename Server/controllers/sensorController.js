const Sensor = require("../models/sensor");

// Biến lưu mốc thời gian lần cuối cùng ghi vào Database
let lastSaveTime = 0; 
const SAVE_INTERVAL = 3 * 60 * 1000; // 3 phút

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
module.exports = {getHistory,handleSaveSensor};