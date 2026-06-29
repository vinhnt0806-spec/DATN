// const SystemConfig = require("../models/systemConfig");
// const { dataStorage } = require("../data/storage");
// const sensorController = require("../controllers/sensorController"); // 🔥 Ghép nối controller vào đây

// // Hàm bổ trợ phát dữ liệu đến tất cả các thiết bị (Web/App/ESP32) đang kết nối
// function broadcastData(wss, messageObject) {
//     wss.clients.forEach((client) => {
//         if (client.readyState === 1) { 
//             client.send(JSON.stringify(messageObject));
//         }
//     });
// }

// module.exports = function setupSocketHandler(wss) {
//     wss.on('connection', function connection(ws) {
//         console.log("🔹 [WS] Có thiết bị mới kết nối!");

//         ws.on('message', async function message(data) {
//             try {
//                 const jsonData = JSON.parse(data.toString());
//                 const { event, ...payloadData } = jsonData;
                
//                 switch (event) {
//                     case 'device_status':
//                         console.log("📥 [WS] Nhận trạng thái thiết bị thực tế từ ESP32!");
//                         if (payloadData.mode !== undefined) dataStorage.mode = payloadData.mode;
//                         if (payloadData.control) Object.assign(dataStorage.control, payloadData.control);
//                         broadcastData(wss, jsonData);
//                         break;

//                     case 'request_sync':
//                         console.log("🔄 [WS] Một thiết bị vừa yêu cầu đồng bộ dữ liệu.");
//                         ws.send(JSON.stringify({
//                             event: "sync",
//                             mode: dataStorage.mode,
//                             sensorData: dataStorage.sensorData,
//                             control: dataStorage.control,
//                             thresholds: dataStorage.thresholds
//                         }));
//                         break;
                        
//                     case 'sync':
//                         console.log("📥 [WS] Nhận dữ liệu đồng bộ thực tế từ ESP32!");
//                         if (payloadData.mode !== undefined) dataStorage.mode = payloadData.mode;
//                         if (payloadData.sensorData) Object.assign(dataStorage.sensorData, payloadData.sensorData);
//                         if (payloadData.control) Object.assign(dataStorage.control, payloadData.control);
//                         if (payloadData.thresholds) Object.assign(dataStorage.thresholds, payloadData.thresholds);
//                         broadcastData(wss, jsonData);
//                         break;
                        
//                     case 'sensor':
//                         // 1. Cập nhật RAM
//                         Object.assign(dataStorage.sensorData, payloadData);
//                         // 2. Đồng bộ realtime cho các web khác đang mở
//                         broadcastData(wss, jsonData);
//                         // 3. 🔥 ĐÃ TỐI ƯU: Gọi hàm kiểm tra thời gian và lưu DB tập trung từ Controller
//                         await sensorController.handleSaveSensor(payloadData);
//                         break;
                        
//                     case 'mode':
//                         if (payloadData.mode !== undefined) {
//                             dataStorage.mode = payloadData.mode;
//                             broadcastData(wss, jsonData);
//                             await SystemConfig.updateOne(
//                                 { configId: "main_config" },
//                                 { $set: { mode: payloadData.mode } },
//                                 { upsert: true }
//                             );
//                         }
//                         break;
                        
//                     case 'control':
//                         Object.assign(dataStorage.control, payloadData);
//                         broadcastData(wss, jsonData);
//                         break;
                        
//                     case 'threshold':
//                         Object.assign(dataStorage.thresholds, payloadData);
//                         broadcastData(wss, jsonData);
//                         await SystemConfig.updateOne(
//                             { configId: "main_config" },
//                             { $set: { thresholds: dataStorage.thresholds } },
//                             { upsert: true }
//                         );
//                         console.log("[WS -> DB] Đã cập nhật các ngưỡng vào Database!");
//                         break;

//                     default:
//                         console.log("[WS] Sự kiện không xác định:", event);
//                 }
//             } catch (error) {
//                 console.error("[WS] Lỗi xử lý gói tin:", error.message);
//             }
//         });
//         ws.on('close', () => console.log("[WS] Thiết bị ngắt kết nối!"));
//     });
// };

const SystemConfig = require("../models/systemConfig");
const { dataStorage } = require("../data/storage");
const sensorController = require("../controllers/sensorController"); 

// Hàm bổ trợ phát dữ liệu đến tất cả các thiết bị (Web/App/ESP32) đang kết nối
function broadcastData(wss, messageObject) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { 
            client.send(JSON.stringify(messageObject));
        }
    });
}

module.exports = function setupSocketHandler(wss) {
    
    // Hàm cập nhật trạng thái online/offline của ESP32 và phát đi cho các ứng dụng Web/App nhận biết
    function setDeviceOnline(isOnline) {
        if (dataStorage.deviceStatus.online === isOnline) return; // Tránh phát thông báo trùng lặp
        
        dataStorage.deviceStatus.online = isOnline;
        dataStorage.deviceStatus.lastSeen = new Date();
        
        broadcastData(wss, {
            event: "device_status_changed",
            online: isOnline,
            lastSeen: dataStorage.deviceStatus.lastSeen
        });
        
        console.log(isOnline ? "🟢 [Device] ESP32 đã ONLINE" : "🔴 [Device] ESP32 đã OFFLINE");
    }

    // Các event đặc trưng chỉ ESP32 gửi để làm nhịp tim (heartbeat) nhận diện tự động
    const ESP32_ONLY_EVENTS = ['sensor', 'device_status', 'ping'];

    wss.on('connection', function connection(ws) {
        console.log("🔹 [WS] Có thiết bị mới kết nối!");
        ws.isEsp32 = false; // Mặc định khi mới kết nối chưa xác định là ESP32

        ws.on('message', async function message(data) {
            try {
                const jsonData = JSON.parse(data.toString());
                const { event, ...payloadData } = jsonData;
                
                // Tự động nhận diện thiết bị dựa trên danh sách các event đặc trưng từ ESP32
                if (ESP32_ONLY_EVENTS.includes(event)) {
                    ws.isEsp32 = true;
                    dataStorage.deviceStatus.lastSeen = new Date();
                    if (!dataStorage.deviceStatus.online) setDeviceOnline(true);
                }
                
                switch (event) {
                    case 'ping':
                        // Dùng để duy trì kết nối ổn định và cập nhật thời gian lastSeen phía trên
                        break;

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
                            thresholds: dataStorage.thresholds,
                            deviceStatus: dataStorage.deviceStatus // Đồng bộ thêm trạng thái online hiện tại khi giao diện load
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
                        // 3. Gọi hàm kiểm tra thời gian và lưu DB tập trung từ Controller
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

        ws.on('close', () => {
            console.log("🔸 [WS] Thiết bị ngắt kết nối!");
            if (ws.isEsp32) {
                // Đề phòng trường hợp có nhiều socket ESP32 ảo mở cùng lúc, chỉ chuyển thành offline khi không còn mạch thực tế nào kết nối ổn định
                let stillHasEsp32 = false;
                wss.clients.forEach((client) => {
                    if (client !== ws && client.isEsp32 && client.readyState === 1) {
                        stillHasEsp32 = true;
                    }
                });
                if (!stillHasEsp32) setDeviceOnline(false);
            }
        });
    });

    // Cơ chế giám sát ngầm: Đề phòng ESP32 mất nguồn hoặc mất mạng đột ngột mà không kịp đóng socket hoàn chỉnh
    const OFFLINE_TIMEOUT = 8000; // 8 giây (Gấp 4 lần chu kỳ gửi dữ liệu 2 giây của mạch phần cứng)
    const offlineWatcher = setInterval(() => {
        if (dataStorage.deviceStatus.online && dataStorage.deviceStatus.lastSeen) {
            const diff = Date.now() - new Date(dataStorage.deviceStatus.lastSeen).getTime();
            if (diff > OFFLINE_TIMEOUT) setDeviceOnline(false);
        }
    }, 3000);

    // Giải phóng bộ nhớ của interval giám sát khi WebSocket server dừng hoạt động
    wss.on('close', () => clearInterval(offlineWatcher));
};