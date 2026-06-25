const SystemConfig = require("../models/systemConfig");
const { dataStorage } = require("../data/storage");
const sensorController = require("../controllers/sensorController"); // 🔥 Ghép nối controller vào đây

// Hàm bổ trợ phát dữ liệu đến tất cả các thiết bị (Web/App/ESP32) đang kết nối
function broadcastData(wss, messageObject) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { 
            client.send(JSON.stringify(messageObject));
        }
    });
}

module.exports = function setupSocketHandler(wss) {
    wss.on('connection', function connection(ws) {
        console.log("🔹 [WS] Có thiết bị mới kết nối!");

        ws.on('message', async function message(data) {
            try {
                const jsonData = JSON.parse(data.toString());
                const { event, ...payloadData } = jsonData;
                
                switch (event) {
                    case 'device_status':
                        console.log("📥 [WS] Nhận trạng thái thiết bị thực tế từ ESP32!");
                        if (payloadData.mode !== undefined) dataStorage.mode = payloadData.mode;
                        if (payloadData.control) Object.assign(dataStorage.control, payloadData.control);
                        broadcastData(wss, jsonData);
                        break;

                    case 'request_sync':
                        console.log("🔄 [WS] Một thiết bị vừa yêu cầu đồng bộ dữ liệu.");
                        ws.send(JSON.stringify({
                            event: "sync",
                            mode: dataStorage.mode,
                            sensorData: dataStorage.sensorData,
                            control: dataStorage.control,
                            thresholds: dataStorage.thresholds
                        }));
                        break;
                        
                    case 'sync':
                        console.log("📥 [WS] Nhận dữ liệu đồng bộ thực tế từ ESP32!");
                        if (payloadData.mode !== undefined) dataStorage.mode = payloadData.mode;
                        if (payloadData.sensorData) Object.assign(dataStorage.sensorData, payloadData.sensorData);
                        if (payloadData.control) Object.assign(dataStorage.control, payloadData.control);
                        if (payloadData.thresholds) Object.assign(dataStorage.thresholds, payloadData.thresholds);
                        broadcastData(wss, jsonData);
                        break;
                        
                    case 'sensor':
                        // 1. Cập nhật RAM
                        Object.assign(dataStorage.sensorData, payloadData);
                        // 2. Đồng bộ realtime cho các web khác đang mở
                        broadcastData(wss, jsonData);
                        // 3. 🔥 ĐÃ TỐI ƯU: Gọi hàm kiểm tra thời gian và lưu DB tập trung từ Controller
                        await sensorController.handleSaveSensor(payloadData);
                        break;
                        
                    case 'mode':
                        if (payloadData.mode !== undefined) {
                            dataStorage.mode = payloadData.mode;
                            broadcastData(wss, jsonData);
                            await SystemConfig.updateOne(
                                { configId: "main_config" },
                                { $set: { mode: payloadData.mode } },
                                { upsert: true }
                            );
                        }
                        break;
                        
                    case 'control':
                        Object.assign(dataStorage.control, payloadData);
                        broadcastData(wss, jsonData);
                        break;
                        
                    case 'threshold':
                        Object.assign(dataStorage.thresholds, payloadData);
                        broadcastData(wss, jsonData);
                        await SystemConfig.updateOne(
                            { configId: "main_config" },
                            { $set: { thresholds: dataStorage.thresholds } },
                            { upsert: true }
                        );
                        console.log("[WS -> DB] Đã cập nhật các ngưỡng vào Database!");
                        break;

                    default:
                        console.log("[WS] Sự kiện không xác định:", event);
                }
            } catch (error) {
                console.error("[WS] Lỗi xử lý gói tin:", error.message);
            }
        });
        ws.on('close', () => console.log("[WS] Thiết bị ngắt kết nối!"));
    });
};