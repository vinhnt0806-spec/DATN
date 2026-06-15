// LOGIN
document.getElementById("form-login")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Lấy dữ liệu từ input
    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        // Gửi request login lên server
        const response = await fetch("/login", {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                email: email,

                password: password

            })
        });

        // Nhận dữ liệu từ server
        const data = await response.json();

        // Login thành công
        if (data.success) {

            alert(data.message);

            // Chuyển sang dashboard
            window.location.href =
                "Client1.html";

        }

        // Login thất bại
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