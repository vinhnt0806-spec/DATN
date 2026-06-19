const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const { WebSocketServer } = require("ws");
const bcrypt = require("bcryptjs");
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

// KẾT NỐI MONGODB
const dbURI = "mongodb+srv://vinh8386:vinhnt0806@doantotnghiep.0swczoc.mongodb.net/vinh?retryWrites=true&w=majority&appName=Doantotnghiep";
mongoose.connect(dbURI)
.then(async () => {
    console.log("🟢 Đã kết nối MongoDB");
    await createAdmin();
})
.catch((err) => console.log("❌ Lỗi kết nối MongoDB:", err));

app.use("/", authRoutes);
app.use("/api", sensorRoutes); 

const server = http.createServer(app);

// KHO LƯU TRỮ TẠM THỜI (RAM SERVER)
let dataStorage = {
    mode: 0,
    sensorData: { nhietdo: 0, doamkk: 0, doamdat: 0, anhsang: 0 },
    control: { bom: 0, phunsuong: 0, den: 0, quat: 0, manche: 0 },
    thresholds: {
        temperatureUpper: 0, temperatureLower: 0,
        humidityUpper: 0, humidityLower: 0,
        soilMoistureUpper: 0, soilMoistureLower: 0,
        lightIntensityUpper: 0, lightIntensityLower: 0
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

// KHỞI TẠO WEBSOCKET SERVER
const wss = new WebSocketServer({ server }); 

wss.on('connection', function connection(ws) {
    console.log("🔹 [WS] Có thiết bị mới kết nối!");

    ws.on('message', async function message(data) {
        try {
            const jsonData = JSON.parse(data.toString());
            
            const broadcastData = (messageObject) => {
                wss.clients.forEach((client) => {
                    if (client.readyState === 1) { 
                        client.send(JSON.stringify(messageObject));
                    }
                });
            };
            
            const { event, ...payloadData } = jsonData;
            
            switch (event) {
                // =================================================================
                // 🔥 THÊM MỚI: Xử lý gói trạng thái ban đầu từ ESP32 gửi lên
                // =================================================================
                case 'device_status':
                    console.log("📥 [WS] Nhận trạng thái thiết bị thực tế từ ESP32!");
                    if (payloadData.mode !== undefined) {
                        dataStorage.mode = payloadData.mode;
                    }
                    if (payloadData.control) {
                        Object.assign(dataStorage.control, payloadData.control);
                    }
                    // Bắn dữ liệu này sang cho Web để Web cập nhật giao diện
                    broadcastData(jsonData);
                    break;

                case 'request_sync':
                    console.log("🔄 [WS] Một thiết bị (App/Web) vừa Reconnect và yêu cầu đồng bộ dữ liệu.");
                    ws.send(JSON.stringify({
                        event: "sync",
                        mode: dataStorage.mode,
                        sensorData: dataStorage.sensorData,
                        control: dataStorage.control,
                        thresholds: dataStorage.thresholds
                    }));
                    console.log("📤 [WS] Đã gửi trả gói 'sync' chứa data mới nhất cho thiết bị.");
                    break;
                    
                case 'sync':
                    console.log("📥 [WS] Nhận dữ liệu đồng bộ thực tế từ ESP32!");
                    if (payloadData.mode !== undefined) dataStorage.mode = payloadData.mode;
                    if (payloadData.sensorData) Object.assign(dataStorage.sensorData, payloadData.sensorData);
                    if (payloadData.control) Object.assign(dataStorage.control, payloadData.control);
                    if (payloadData.thresholds) Object.assign(dataStorage.thresholds, payloadData.thresholds);
                    broadcastData(jsonData);
                    break;
                    
                case 'sensor':
                    Object.assign(dataStorage.sensorData, payloadData);
                    broadcastData(jsonData);
                    
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
                        broadcastData(jsonData);
                        await SystemConfig.updateOne(
                            { configId: "main_config" },
                            { $set: { mode: payloadData.mode } },
                            { upsert: true }
                        );
                    }
                    break;
                    
                case 'control':
                    Object.assign(dataStorage.control, payloadData);
                    broadcastData(jsonData);
                    break;
                    
                case 'threshold':
                    Object.assign(dataStorage.thresholds, payloadData);
                    broadcastData(jsonData);
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

    ws.on('close', () => console.log("🔸 [WS] Thiết bị ngắt kết nối!"));
});

server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server tổng hợp đang chạy tại http://localhost:${port}`);
    console.log(`📡 Cả Web giao diện và ESP32 bây giờ đều kết nối chung qua một cổng này.`);
});