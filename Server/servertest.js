const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const { WebSocketServer } = require("ws");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");
const Sensor = require("./models/sensor");
const SystemConfig = require("./models/systemConfig");

const authRoutes = require("./routes/authRoutes");
const sensorRoutes = require("./routes/sensorRoutes");

async function createAdmin() {
    try {
        const user = await User.findOne({ email: "admin@gmail.com" });
        if (!user) {
            await User.create({
                email: "admin@gmail.com",
                password: await bcrypt.hash("123456", 10)
            });
            console.log("✅ Đã tạo admin");
        } else {
            console.log("✅ Admin đã tồn tại");
        }
    } catch (err) {
        console.log("❌ Lỗi tạo admin:", err);
    }
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../Web")));

// ================== KẾT NỐI MONGODB ==================
// ⚠️ KHÔNG hardcode URI có chứa username/password trong code.
// Tạo file .env ở thư mục gốc với nội dung:
//   MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI)
.then(async () => {
    console.log("🟢 Đã kết nối MongoDB");
    await createAdmin();
})
.catch((err) => console.log("❌ Lỗi kết nối MongoDB:", err));

app.use("/", authRoutes);
app.use("/api", sensorRoutes);

// API REST đơn giản để Web kiểm tra trạng thái thiết bị ngay khi load trang,
// trước khi WebSocket kết nối xong.
app.get("/api/device-status", (req, res) => {
    res.json(dataStorage.deviceStatus);
});

const server = http.createServer(app);

// ================== KHO LƯU TRỮ TẠM THỜI (RAM SERVER) ==================
let dataStorage = {
    mode: 0,
    sensorData: { nhietdo: 0, doamkk: 0, doamdat: 0, anhsang: 0 },
    control: { bom: 0, phunsuong: 0, den: 0, quat: 0, manche: 0 },
    thresholds: {
        temperatureUpper: 0, temperatureLower: 0,
        humidityUpper: 0, humidityLower: 0,
        soilMoistureUpper: 0, soilMoistureLower: 0,
        lightIntensityUpper: 0, lightIntensityLower: 0
    },
    // Trạng thái online/offline của ESP32
    deviceStatus: {
        online: false,
        lastSeen: null
    }
};
let lastSaveTime = 0;

// Nạp cấu hình Mode/Ngưỡng cũ từ MongoDB vào RAM
(async () => {
    try {
        let config = await SystemConfig.findOne({ configId: "main_config" });
        if (!config) {
            console.log("⚠️ Chưa có main_config, tạo mới...");
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
            console.log("✅ Đã tạo main_config");
        }
        dataStorage.mode = config.mode || 0;
        if (config.thresholds) dataStorage.thresholds = config.thresholds;
        console.log("🔄 Đã nạp cấu hình cũ từ Database vào RAM");
    } catch (err) {
        console.log("❌ Lỗi nạp cấu hình:", err);
    }
})();

// ================== WEBSOCKET SERVER ==================
const wss = new WebSocketServer({ server });

// Broadcast tới tất cả client đang mở (không gửi lại cho chính người gửi)
function broadcastData(messageObject, exceptWs = null) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1 && client !== exceptWs) {
            client.send(JSON.stringify(messageObject));
        }
    });
}

// Cập nhật & phát trạng thái online/offline cho mọi client Web
function setDeviceOnline(isOnline) {
    if (dataStorage.deviceStatus.online === isOnline) return; // tránh broadcast trùng
    dataStorage.deviceStatus.online = isOnline;
    dataStorage.deviceStatus.lastSeen = new Date();
    broadcastData({
        event: "device_status_changed",
        online: isOnline,
        lastSeen: dataStorage.deviceStatus.lastSeen
    });
    console.log(isOnline ? "🟢 [Device] ESP32 đã ONLINE" : "🔴 [Device] ESP32 đã OFFLINE");
}

// Các event mà CHỈ ESP32 gửi (Web không bao giờ gửi các event này)
// -> dùng để tự nhận diện kết nối nào là ESP32, không cần ESP32 phải "identify" gì cả.
// "sensor" được ESP32 gửi đều đặn mỗi 2 giây -> đóng vai trò nhịp tim (heartbeat) tự nhiên.
const ESP32_ONLY_EVENTS = ['sensor', 'device_status', 'ping'];

wss.on('connection', function connection(ws) {
    console.log("🔹 [WS] Có thiết bị mới kết nối!");
    ws.isEsp32 = false;

    ws.on('message', async function message(data) {
        try {
            const jsonData = JSON.parse(data.toString());
            const { event, ...payloadData } = jsonData;

            // Bất kỳ message nào thuộc nhóm "chỉ ESP32 gửi" đều coi là dấu hiệu "còn sống"
            if (ESP32_ONLY_EVENTS.includes(event)) {
                ws.isEsp32 = true;
                dataStorage.deviceStatus.lastSeen = new Date();
                if (!dataStorage.deviceStatus.online) setDeviceOnline(true);
            }

            switch (event) {
                case 'ping':
                    // Chỉ để giữ kết nối / cập nhật lastSeen ở trên, không cần làm gì thêm
                    break;

                case 'device_status':
                    console.log("📥 [WS] Nhận trạng thái thiết bị thực tế từ ESP32!");
                    if (payloadData.mode !== undefined) {
                        dataStorage.mode = payloadData.mode;
                    }
                    if (payloadData.control) {
                        Object.assign(dataStorage.control, payloadData.control);
                    }
                    broadcastData(jsonData, ws);
                    break;

                case 'request_sync':
                    console.log("🔄 [WS] Một thiết bị (App/Web) vừa Reconnect và yêu cầu đồng bộ dữ liệu.");
                    ws.send(JSON.stringify({
                        event: "sync",
                        mode: dataStorage.mode,
                        sensorData: dataStorage.sensorData,
                        control: dataStorage.control,
                        thresholds: dataStorage.thresholds,
                        deviceStatus: dataStorage.deviceStatus // gửi kèm trạng thái online/offline hiện tại
                    }));
                    console.log("📤 [WS] Đã gửi trả gói 'sync' chứa data mới nhất cho thiết bị.");
                    break;

                case 'sync':
                    console.log("📥 [WS] Nhận dữ liệu đồng bộ thực tế từ ESP32!");
                    if (payloadData.mode !== undefined) dataStorage.mode = payloadData.mode;
                    if (payloadData.sensorData) Object.assign(dataStorage.sensorData, payloadData.sensorData);
                    if (payloadData.control) Object.assign(dataStorage.control, payloadData.control);
                    if (payloadData.thresholds) Object.assign(dataStorage.thresholds, payloadData.thresholds);
                    broadcastData(jsonData, ws);
                    break;

                case 'sensor':
                    Object.assign(dataStorage.sensorData, payloadData);
                    broadcastData(jsonData, ws);

                    try {
                        const now = Date.now();
                        if (now - lastSaveTime >= 60000) {
                            await Sensor.create({
                                nhietdo: payloadData.nhietdo ?? dataStorage.sensorData.nhietdo,
                                doamkk: payloadData.doamkk ?? dataStorage.sensorData.doamkk,
                                doamdat: payloadData.doamdat ?? dataStorage.sensorData.doamdat,
                                anhsang: payloadData.anhsang ?? dataStorage.sensorData.anhsang
                            });
                            lastSaveTime = now;
                            console.log("💾 [WS -> DB] Đã tự động lưu dữ liệu cảm biến vào MongoDB");
                        }
                    } catch (dbErr) {
                        console.error("❌ Lỗi ghi Database từ WebSocket:", dbErr.message);
                    }
                    break;

                case 'mode':
                    if (payloadData.mode !== undefined) {
                        dataStorage.mode = payloadData.mode;
                        broadcastData(jsonData, ws);
                        await SystemConfig.updateOne(
                            { configId: "main_config" },
                            { $set: { mode: payloadData.mode } },
                            { upsert: true }
                        );
                    }
                    break;

                case 'control':
                    Object.assign(dataStorage.control, payloadData);
                    broadcastData(jsonData, ws);
                    break;

                case 'threshold':
                    Object.assign(dataStorage.thresholds, payloadData);
                    broadcastData(jsonData, ws);
                    await SystemConfig.updateOne(
                        { configId: "main_config" },
                        { $set: { thresholds: dataStorage.thresholds } },
                        { upsert: true }
                    );
                    console.log("⚙️ [WS -> DB] Đã cập nhật đồng bộ TẤT CẢ các ngưỡng vào Database thành công!");
                    break;
            }
        } catch (error) {
            console.error("❌ [WS] Lỗi JSON hoặc Xử lý:", error.message);
        }
    });

    ws.on('close', () => {
        console.log("🔸 [WS] Thiết bị ngắt kết nối! (esp32:", ws.isEsp32 + ")");
        if (ws.isEsp32) {
            // Đề phòng có nhiều kết nối ESP32 cùng lúc — chỉ offline khi KHÔNG còn ESP32 nào khác
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

// ================== GIÁM SÁT MẤT KẾT NỐI "NGẦM" ==================
// ESP32 gửi 'sensor' đều đặn mỗi 2 giây (xem hàm sendSensor() + loop() phía ESP32),
// nên đây chính là nhịp tim tự nhiên — không cần ESP32 phải làm thêm gì.
// Nếu quá lâu không thấy gì từ ESP32 (kể cả khi socket chưa kịp đóng do rút mạng đột ngột)
// thì tự đánh dấu offline.
const OFFLINE_TIMEOUT = 8000; // 8s (gấp ~4 lần chu kỳ gửi sensor 2s) -> an toàn, vẫn phản hồi nhanh
const offlineWatcher = setInterval(() => {
    if (dataStorage.deviceStatus.online && dataStorage.deviceStatus.lastSeen) {
        const diff = Date.now() - new Date(dataStorage.deviceStatus.lastSeen).getTime();
        if (diff > OFFLINE_TIMEOUT) setDeviceOnline(false);
    }
}, 3000);

wss.on('close', () => clearInterval(offlineWatcher));

server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server tổng hợp đang chạy tại http://localhost:${port}`);
    console.log(`📡 Cả Web giao diện và ESP32 bây giờ đều kết nối chung qua một cổng này.`);
});