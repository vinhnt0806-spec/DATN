// 1. Khai báo URL của server backend ở đầu file
const BACKEND_URL = "https://datn-iot-server.onrender.com";

// LOGIN
document.getElementById("form-login")
.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // 2. Sửa fetch: thay "/login" bằng "${BACKEND_URL}/login"
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            window.location.href = "Client1.html";
        }
        else {
            alert(data.message);
        }
    } catch (err) {
        console.log(err);
        alert("Không thể kết nối server");
    }
});

// HIỆN / ẨN PASSWORD
$(document).ready(function () {

    $("#eye").click(function () {

        $(this).toggleClass("open");

        $(this)
            .children("i")
            .toggleClass(
                "fa-eye fa-eye-slash"
            );

        const passwordInput =
            $("#password");

        passwordInput.attr(

            "type",

            $(this).hasClass("open")
                ? "text"
                : "password"
        );
    });
});