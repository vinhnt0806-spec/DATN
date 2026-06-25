const bcrypt = require("bcryptjs");
const User = require("../models/user"); // Bạn nhớ kiểm tra lại đường dẫn tới file user model cho đúng nhé

// 1. Hàm tự động tạo Admin (Sẽ được gọi từ server.js khi kết nối DB thành công)
exports.createAdmin = async () => {
    try {
        const user = await User.findOne({ email: "admin@gmail.com" });
        if (!user) {
            await User.create({
                email: "admin@gmail.com",
                password: await bcrypt.hash("123456", 10)
            });
            console.log("✅ [Auth] Đã tự động khởi tạo tài khoản admin");
        } else {
            console.log("✅ [Auth] Tài khoản admin đã tồn tại");
        }
    } catch (err) {
        console.log("❌ [Auth] Lỗi tự động tạo admin:", err);
    }
};

// 2. Logic Đăng nhập (Giữ nguyên của bạn)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Sai email" });
        }
        const pw = await bcrypt.compare(password, user.password);
        if (!pw) {
            return res.json({ success: false, message: "Sai mật khẩu" });
        }
        res.json({ success: true, message: "Đăng nhập thành công" });
    }
    catch (err) {
        res.json({ success: false, message: "Đăng nhập thất bại" });
    }
};