// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const http = require("http");
// const { WebSocketServer } = require("ws");
// const mongoose = require("mongoose");

// // Import cấu hình RAM và Handler WebSocket
// const { initMemoryStore } = require("./data/storage");
// const setupSocketHandler = require("./sockets/socketHandler");

// // Import Controller để lấy hàm tạo Admin
// const authController = require("./controllers/authController"); 

// // Import các HTTP routes
// const authRoutes = require("./routes/authRoutes");
// const sensorRoutes = require("./routes/sensorRoutes");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json());
// app.use(cors());
// app.use(express.static(path.join(__dirname, "../Web")));

// // 1. KẾT NỐI MONGODB TRỰC TIẾP
// const dbURI = "mongodb+srv://vinh8386:vinhnt0806@doantotnghiep.0swczoc.mongodb.net/vinh?retryWrites=true&w=majority&appName=Doantotnghiep";
// mongoose.connect(dbURI)
// .then(async () => {
//     console.log("🟢 Đã kết nối MongoDB");
//     // Tự động khởi tạo tài khoản Admin
//     await authController.createAdmin(); 
//     // Khởi tạo bộ nhớ RAM sau khi DB đã kết nối thành công
//     await initMemoryStore(); 
// })
// .catch((err) => console.log("❌ Lỗi kết nối MongoDB:", err));

// // 2. ĐĂNG KÝ CÁC HTTP ROUTES
// app.use("/", authRoutes);
// app.use("/api", sensorRoutes); 

// // 3. TẠO SERVER TỔNG HỢP HTTP & WEBSOCKET
// const server = http.createServer(app);
// const wss = new WebSocketServer({ server }); 

// // 4. KÍCH HOẠT LOGIC WEBSOCKET TẬP TRUNG
// setupSocketHandler(wss);

// server.listen(port, "0.0.0.0", () => {
//     console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
// });