// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const User = require("./models/user");

// const server = express();
// const port = 3000;

// server.use(express.json());
// server.use(cors());
// server.use(express.static(path.join(__dirname, "../Web")));

// server.get("/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "Web", "login.html"));
// });

// // KẾT NỐI MONGODB
// const dbURI = "mongodb://127.0.0.1:27017/vinh";

// mongoose.connect(dbURI)
// .then(async() => {
//     console.log("Đã kết nối MongoDB");
//     await createAdmin();
// })
// .catch((err) => {
//     console.log("❌ Lỗi MongoDB:", err);
// });

// // SCHEMA + MODEL
// const sensorSchema = new mongoose.Schema({
//     nhietdo: Number,
//     doamkk: Number,
//     doamdat: Number,
//     anhsang: Number,
//     created_at: {
//         type: Date,
//         default: Date.now
//     }
// });

// const Sensor = mongoose.model(
//     "Sensor",
//     sensorSchema
// );

// async function createAdmin() {

//     try {

//         // Kiểm tra tồn tại
//         const existingUser = await User.findOne({

//             email: "admin@gmail.com"

//         });

//         if (existingUser) {

//             console.log("Admin đã tồn tại");

//             return;
//         }

//         // Mã hóa password
//         const hashedPassword =
//             await bcrypt.hash("123456", 10);

//         // Tạo user
//         await User.create({

//             email: "admin@gmail.com",

//             password: hashedPassword

//         });

//         console.log("Đã tạo admin");

//     } catch (err) {

//         console.log(err);
//     }
// }

//  // Khởi tạo dữ liệu
// let dataStorage = {
//     sensorData: { nhietdo: 0, doamkk: 0, doamdat: 0, anhsang: 0 },
//     control: { bom: 0, phunsuong: 0, den: 0, quat: 0 },
//     system: { mode: 0 },
//     thresholds: { temperature: 0, humidity: 0, soilMoisture: 0, lightIntensity: 0 }
//  };
//  let lastSaveTime = 0;

// // API esp32 gửi dữ liệu
// server.post("/update-sensor", async (req, res) => {

//     console.log("Dữ liệu từ ESP32:", req.body);

//     if (req.body.nhietdo !== undefined)
//         dataStorage.sensorData.nhietdo = req.body.nhietdo;

//     if (req.body.doamkk !== undefined)
//         dataStorage.sensorData.doamkk = req.body.doamkk;

//     if (req.body.doamdat !== undefined)
//         dataStorage.sensorData.doamdat = req.body.doamdat;

//     if (req.body.anhsang !== undefined)
//         dataStorage.sensorData.anhsang = req.body.anhsang;

// // LƯU MONGODB
// try {

//     const now = Date.now();

//     // chỉ lưu mỗi 5 giây
//     if (now - lastSaveTime >= 5000) {

//         await Sensor.create({

//             nhietdo: req.body.nhietdo,
//             doamkk: req.body.doamkk,
//             doamdat: req.body.doamdat,
//             anhsang: req.body.anhsang

//         });

//         lastSaveTime = now;

//         console.log("Đã lưu MongoDB");
//     }

// } catch (err) {

//     console.log("Lỗi lưu MongoDB:", err);

// }

// res.json({ status: "success" });

// });

// // API Web lấy dữ liệu
// server.get("/data", (req, res) => {

//     res.json(dataStorage);

// });

// server.post("/login", async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.json({ success: false, message: "Sai email" });
//         }

//         const ok = await bcrypt.compare(password, user.password);

//         if (!ok) {
//             return res.json({ success: false, message: "Sai mật khẩu" });
//         }

//         res.json({ success: true, message: "Login OK" });

//     } catch (err) {
//         res.json({ success: false, message: "Server error" });
//     }
// });

// // API điều khiển thiết bị
// server.post("/control", (req, res) => {

//     if (req.body.bom !== undefined)
//         dataStorage.control.bom = req.body.bom;

//     if (req.body.phunsuong !== undefined)
//         dataStorage.control.phunsuong = req.body.phunsuong;

//     if (req.body.den !== undefined)
//         dataStorage.control.den = req.body.den;

//     if (req.body.quat !== undefined)
//         dataStorage.control.quat = req.body.quat;

//     if (req.body.mode !== undefined)
//         dataStorage.system.mode = req.body.mode;

//     res.json({ status: "success" });

// });

// // API cập nhật ngưỡng
// server.post("/thresholds", (req, res) => {

//     if (req.body.temperature !== undefined)
//         dataStorage.thresholds.temperature = req.body.temperature;

//     if (req.body.humidity !== undefined)
//         dataStorage.thresholds.humidity = req.body.humidity;

//     if (req.body.soilMoisture !== undefined)
//         dataStorage.thresholds.soilMoisture = req.body.soilMoisture;

//     if (req.body.lightIntensity !== undefined)
//         dataStorage.thresholds.lightIntensity = req.body.lightIntensity;

//     res.json({ status: "success" });

// });

// // API lấy lịch sử
// server.get("/history", async (req, res) => {

//     try {

//         const history = await Sensor.find()
//             .sort({ created_at: -1 })
//             .limit(50);

//         res.json(history);

//     } catch (err) {

//         res.status(500).json(err);

//     }

// });

// // START SERVER
// // server.listen(port, () => {

// //     console.log(`Server đang chạy tại http://localhost:${port}`);

// // });
// server.listen(port, "0.0.0.0", () => {

//     console.log(
//         `Server đang chạy tại http://localhost:${port}`
//     );

// });

// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const mongoose = require("mongoose");
// const { WebSocketServer } = require("ws");
// const bcrypt = require("bcryptjs");
// const User = require("./models/user");

// // Import các Model cần thiết để thao tác trực tiếp với Database
// const Sensor = require("./models/Sensor"); 
// const SystemConfig = require("./models/systemConfig");


// // Chỉ giữ lại: Route phục vụ Auth (Đăng nhập) và History (Tải lịch sử vẽ đồ thị)
// const authRoutes = require("./routes/authRoutes");
// const sensorRoutes = require("./routes/sensorRoutes"); // Trong này CHỈ CÒN giữ lại router.get("/history")

// async function createAdmin() {

//     try {

//         const user = await User.findOne({
//             email: "admin@gmail.com"
//         });

//         if (!user) {

//             await User.create({
//                 email: "admin@gmail.com",
//                 password: await bcrypt.hash("123456", 10)
//             });

//             console.log("✅ Đã tạo admin");

//         } else {

//             console.log("✅ Admin đã tồn tại");

//         }

//     } catch (err) {

//         console.log("❌ Lỗi tạo admin:", err);

//     }
// }

// const server = express();
// const port = 3000;

// server.use(express.json());
// server.use(cors());
// server.use(express.static(path.join(__dirname, "../Web")));

// // KẾT NỐI MONGODB
// const dbURI = "mongodb+srv://vinh8386:vinhnt0806@doantotnghiep.0swczoc.mongodb.net/vinh?retryWrites=true&w=majority&appName=Doantotnghiep";
// mongoose.connect(dbURI)
// .then(async () => {

//     console.log("🟢 Đã kết nối MongoDB");

//     await createAdmin();

// })
// .catch((err) => console.log("❌ Lỗi kết nối MongoDB:", err));

// server.use("/", authRoutes);
// server.use("/api", sensorRoutes); // Kích hoạt route lấy lịch sử đồ thị

// server.listen(port, "0.0.0.0", () => {
//     console.log(`🚀 HTTP Server đang chạy tại http://localhost:${port}`);
// });

// // ========================================================
// // KHO LƯU TRỮ TẠM THỜI (RAM SERVER)
// // ========================================================
// let dataStorage = {
//     mode: 0,
//     sensorData: { nhietdo: 0, doamkk: 0, doamdat: 0, anhsang: 0 },
//     control: { bom: 0, phunsuong: 0, den: 0, quat: 0, manche: 0 },
//     thresholds: {
//         temperatureUpper: 0, temperatureLower: 0,
//         humidityUpper: 0, humidityLower: 0,
//         soilMoistureUpper: 0, soilMoistureLower: 0,
//         lightIntensityUpper: 0, lightIntensityLower: 0
//     }
// };
// let lastSaveTime = 0;

// // Nạp cấu hình Mode/Ngưỡng cũ từ MongoDB vào RAM ngay khi mở server
// (async () => {
//     try {

//         let config = await SystemConfig.findOne({
//             configId: "main_config"
//         });

//         if (!config) {

//             console.log("⚠️ Chưa có main_config, tạo mới...");

//             config = await SystemConfig.create({

//                 configId: "main_config",

//                 mode: 0,

//                 thresholds: {
//                     temperatureUpper: 0,
//                     temperatureLower: 0,
//                     humidityUpper: 0,
//                     humidityLower: 0,
//                     soilMoistureUpper: 0,
//                     soilMoistureLower: 0,
//                     lightIntensityUpper: 0,
//                     lightIntensityLower: 0
//                 }

//             });

//             console.log("✅ Đã tạo main_config");
//         }

//         dataStorage.mode = config.mode || 0;

//         if (config.thresholds)
//             dataStorage.thresholds = config.thresholds;

//         console.log("🔄 Đã nạp cấu hình cũ từ Database vào RAM");

//     } catch (err) {

//         console.log("❌ Lỗi nạp cấu hình:", err);

//     }
// })();

// // ========================================================
// // KHỞI TẠO WEBSOCKET SERVER (CỔNG 8084)
// // ========================================================
// const wss = new WebSocketServer({ port: 8084 });
// console.log(`🚀 WebSocket Server đang chạy tại cổng 8084...`);

// wss.on('connection', function connection(ws) {
//     console.log("🔹 [WS] Có thiết bị mới kết nối!");

//     // ĐÃ XÓA: Không gửi RAM ảo, không tự gọi ESP32 nữa.
//     // Giao phó toàn quyền chủ động cho Web (Web gọi -> Server truyền lệnh -> ESP32 trả lời).

//     ws.on('message', async function message(data) {
//         try {
//             const jsonData = JSON.parse(data.toString());
            
//             // Hàm dùng chung để phát dữ liệu cho tất cả các client khác
//             const broadcastData = (messageObject) => {
//                 wss.clients.forEach((client) => {
//                     if (client !== ws && client.readyState === 1) { 
//                         client.send(JSON.stringify(messageObject));
//                     }
//                 });
//             };
            
//             // Tách riêng tên 'event', gom toàn bộ dữ liệu thực tế vào 'payloadData'
//             const { event, ...payloadData } = jsonData;
            
//             switch (event) {
//                 // --------------------------------------------------------
//                 // 1. WEB YÊU CẦU ĐỒNG BỘ -> ĐẨY LỆNH XUỐNG ESP32
//                 // --------------------------------------------------------
//                 case 'request_sync':
//                     console.log("🔄 [WS] Web yêu cầu đồng bộ. Chuyển lệnh xuống ESP32...");
//                     broadcastData({ event: "request_sync" }); 
//                     break;
                    
//                 // --------------------------------------------------------
//                 // 2. ESP32 GỬI TRẢ DỮ LIỆU ĐỒNG BỘ -> LƯU RAM & ĐẨY LÊN WEB
//                 // --------------------------------------------------------
//                 case 'sync':
//                     console.log("📥 [WS] Nhận dữ liệu đồng bộ thực tế từ ESP32!");
//                     // Vẫn lưu vào RAM để backup hoặc ghi Database
//                     if (payloadData.mode !== undefined) dataStorage.mode = payloadData.mode;
//                     if (payloadData.sensorData) Object.assign(dataStorage.sensorData, payloadData.sensorData);
//                     if (payloadData.control) Object.assign(dataStorage.control, payloadData.control);
//                     if (payloadData.thresholds) Object.assign(dataStorage.thresholds, payloadData.thresholds);

//                     // Đẩy dữ liệu thực tế lên Web
//                     broadcastData(jsonData);
//                     break;
                    
//                 // --------------------------------------------------------
//                 // 3. CÁC CASE CẬP NHẬT THÔNG THƯỜNG TỪ ESP32 VÀ WEB
//                 // --------------------------------------------------------
//                 case 'sensor':
//                 Object.assign(dataStorage.sensorData, payloadData);
//                 broadcastData(jsonData);
                
//                 try {
//                     const now = Date.now();
//                     // SỬA TẠI ĐÂY: Thay 5000 thành 60000 (1 phút) hoặc 300000 (5 phút)
//                     if (now - lastSaveTime >= 60000) { 
//                         await Sensor.create({
//                             nhietdo: payloadData.nhietdo ?? dataStorage.sensorData.nhietdo,
//                             doamkk: payloadData.doamkk ?? dataStorage.sensorData.doamkk,
//                             doamdat: payloadData.doamdat ?? dataStorage.sensorData.doamdat,
//                             anhsang: payloadData.anhsang ?? dataStorage.sensorData.anhsang
//                         });
//                         lastSaveTime = now;
//                         console.log("💾 [WS -> DB] Đã tự động lưu dữ liệu cảm biến vào MongoDB");
//                     }
//                 } catch (dbErr) {
//                     console.error("❌ Lỗi ghi Database từ WebSocket:", dbErr.message);
//                 }
//                 break;
                    
//                 case 'mode':
//                     if (payloadData.mode !== undefined) {
//                         dataStorage.mode = payloadData.mode;
//                         broadcastData(jsonData);
//                         await SystemConfig.updateOne(
//                             { configId: "main_config" },
//                             { $set: { mode: payloadData.mode } },
//                             { upsert: true }
//                         );
//                     }
//                     break;
                    
//                 case 'control':
//                     Object.assign(dataStorage.control, payloadData);
//                     broadcastData(jsonData);
//                     break;
                    
//                 case 'threshold':
//                     Object.assign(dataStorage.thresholds, payloadData);
//                     broadcastData(jsonData);
//                     await SystemConfig.updateOne(
//                         { configId: "main_config" },
//                         { $set: { thresholds: dataStorage.thresholds } },
//                         { upsert: true }
//                     );
//                     console.log("⚙️ [WS -> DB] Đã cập nhật đồng bộ TẤT CẢ các ngưỡng vào Database thành công!");
//                     break;
//             }
//         } catch (error) {
//             console.error("❌ [WS] Lỗi JSON hoặc Xử lý:", error.message);
//         }
//     });

//     ws.on('close', () => console.log("🔸 [WS] Thiết bị ngắt kết nối!"));
// });

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http"); // 🟢 BƯỚC 2: Thêm module http mặc định của Node.js
const { WebSocketServer } = require("ws");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

// Import các Model cần thiết để thao tác trực tiếp với Database
const Sensor = require("./models/Sensor"); 
const SystemConfig = require("./models/systemConfig");

// Route phục vụ Auth (Đăng nhập) và History (Tải lịch sử vẽ đồ thị)
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

// 🟢 BƯỚC 2: Thay đổi cách khởi tạo để gom server
const app = express(); // Đổi tên thành 'app' để phân biệt với HTTP Server bên dưới
const port = process.env.PORT || 3000; // Tự động lấy port của hệ thống hoặc mặc định 3000

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../Web")));

// KẾT NỐI MONGODB (Khuyên dùng biến môi trường .env khi public thực tế)
const dbURI = "mongodb+srv://vinh8386:vinhnt0806@doantotnghiep.0swczoc.mongodb.net/vinh?retryWrites=true&w=majority&appName=Doantotnghiep";
mongoose.connect(dbURI)
.then(async () => {
    console.log("🟢 Đã kết nối MongoDB");
    await createAdmin();
})
.catch((err) => console.log("❌ Lỗi kết nối MongoDB:", err));

app.use("/", authRoutes);
app.use("/api", sensorRoutes); 

// 🟢 BƯỚC 2: Tạo một HTTP Server bọc quanh Express App
const server = http.createServer(app);

// ========================================================
// KHO LƯU TRỮ TẠM THỜI (RAM SERVER)
// ========================================================
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

// Nạp cấu hình Mode/Ngưỡng cũ từ MongoDB vào RAM ngay khi mở server
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

// ========================================================
// KHỞI TẠO WEBSOCKET SERVER (CHẠY CÙNG PORT 3000)
// ========================================================
// 🟢 BƯỚC 2: Truyền trực tiếp đối tượng HTTP server vào thay vì gán port: 8084 cố định
const wss = new WebSocketServer({ server }); 

wss.on('connection', function connection(ws) {
    console.log("🔹 [WS] Có thiết bị mới kết nối!");

    ws.on('message', async function message(data) {
        try {
            const jsonData = JSON.parse(data.toString());
            
            const broadcastData = (messageObject) => {
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === 1) { 
                        client.send(JSON.stringify(messageObject));
                    }
                });
            };
            
            const { event, ...payloadData } = jsonData;
            
            switch (event) {
                case 'request_sync':
                    console.log("🔄 [WS] Web yêu cầu đồng bộ. Chuyển lệnh xuống ESP32...");
                    broadcastData({ event: "request_sync" }); 
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

// 🟢 BƯỚC 2: Gọi hàm lắng nghe từ HTTP server (quản lý chung cả Express lẫn WebSocket)
server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server tổng hợp đang chạy tại http://localhost:${port}`);
    console.log(`📡 Cả Web giao diện và ESP32 bây giờ đều kết nối chung qua một cổng này.`);
});