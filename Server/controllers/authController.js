const bcrypt = require("bcryptjs");
const User = require("../models/user");

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