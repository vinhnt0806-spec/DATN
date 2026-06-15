// // =============================
// // BIẾN TOÀN CỤC
// // =============================
// let sensorData = null;
// let thresholds = {};
// let currentMode = 0;
// let control = null;

// const API_URL = "http://10.219.42.111:3000";

// // =============================
// // GỬI DỮ LIỆU
// // =============================
// async function postData(endpoint, data) {
//     try {
//         const response = await fetch(`${API_URL}${endpoint}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(data)
//         });
//         return await response.json();
//     } catch (err) {
//         console.error("Lỗi gửi dữ liệu:", err);
//     }
// }

// // =============================
// // HIỂN THỊ TRẠNG THÁI THIẾT BỊ
// // =============================
// function updateDeviceSwitches() {
//     if (!control) return;

//     const deviceIds = ['togglePump', 'toggleSpray', 'toggleLight', 'toggleFan', 'toggleShade'];

//     const statusMap = {
//         'togglePump': control.bom,
//         'toggleSpray': control.phunsuong,
//         'toggleLight': control.den,
//         'toggleFan': control.quat,
//         'toggleShade': control.manche
//     };

//     deviceIds.forEach(id => {
//         const el = document.getElementById(id);
//         if (!el) return;

//         // Nếu user đang bấm (tương tác) thì bỏ qua để không bị giật lag nút
//         if (el.matches(':active')) return;

//         if (el.checked !== (statusMap[id] === 1)) {
//             el.checked = statusMap[id] === 1;
//         }
        
//         // Disable nút nếu đang ở chế độ AUTO (0)
//         el.disabled = currentMode === 0;
//     });
// }

// // =============================
// // LẤY DỮ LIỆU SERVER
// // =============================
// async function refreshData() {
//     try {
//         const response = await fetch(`${API_URL}/data`);
//         const data = await response.json();

//         sensorData = data.sensorData || {};
//         control = data.control || {};
//         thresholds = data.thresholds || {};
//         currentMode = data.system?.mode || 0;

//         // Cập nhật giá trị hiển thị CẢM BIẾN
//         document.getElementById('temperature').innerText = `${sensorData.nhietdo ?? 0} °C`;
//         document.getElementById('humidity').innerText = `${sensorData.doamkk ?? 0} %`;
//         document.getElementById('soilMoisture').innerText = `${sensorData.doamdat ?? 0} %`;
//         document.getElementById('lightIntensity').innerText = `${sensorData.anhsang ?? 0} lux`;

//         // Cập nhật text hiển thị THRESHOLD
//         document.getElementById('temperatureUpper').innerText = (thresholds.temperatureUpper ?? 0) + " °C";
//         document.getElementById('temperatureLower').innerText = (thresholds.temperatureLower ?? 0) + " °C";
        
//         document.getElementById('humidityUpper').innerText = (thresholds.humidityUpper ?? 0) + " %";
//         document.getElementById('humidityLower').innerText = (thresholds.humidityLower ?? 0) + " %";
        
//         document.getElementById('soilMoistureUpper').innerText = (thresholds.soilMoistureUpper ?? 0) + " %";
//         document.getElementById('soilMoistureLower').innerText = (thresholds.soilMoistureLower ?? 0) + " %";
        
//         document.getElementById('lightIntensityUpper').innerText = (thresholds.lightIntensityUpper ?? 0) + " lux";
//         document.getElementById('lightIntensityLower').innerText = (thresholds.lightIntensityLower ?? 0) + " lux";

//         // ==========================================
//         // QUAN TRỌNG: ĐIỀN LẠI GIÁ TRỊ VÀO Ô INPUT
//         // ==========================================
//         const inputs = [
//             { id: 'setTemperatureUpper', key: 'temperatureUpper' },
//             { id: 'setTemperatureLower', key: 'temperatureLower' },
//             { id: 'setHumidityUpper', key: 'humidityUpper' },
//             { id: 'setHumidityLower', key: 'humidityLower' },
//             { id: 'setSoilMoistureUpper', key: 'soilMoistureUpper' },
//             { id: 'setSoilMoistureLower', key: 'soilMoistureLower' },
//             { id: 'setLightIntensityUpper', key: 'lightIntensityUpper' },
//             { id: 'setLightIntensityLower', key: 'lightIntensityLower' }
//         ];

//         inputs.forEach(item => {
//             const inputEl = document.getElementById(item.id);
//             // Chỉ điền giá trị vào nếu user không đang click vào ô đó để gõ (tránh việc mất chữ đang gõ dở)
//             if (inputEl && document.activeElement !== inputEl) {
//                 if (thresholds[item.key] !== undefined) {
//                     inputEl.value = thresholds[item.key];
//                 }
//             }
//         });

//         // Cập nhật MODE
//         const modeSwitch = document.getElementById('modeSwitch');
//         if (modeSwitch && !modeSwitch.hasAttribute('data-user-changing')) {
//             modeSwitch.checked = currentMode === 1;
//         }

//         updateDeviceSwitches();

//     } catch (err) {
//         console.error("Lỗi lấy dữ liệu:", err);
//     }
// }

// // =============================
// // ĐIỀU KHIỂN (MANUAL)
// // =============================
// function setupDeviceControl() {
//     const controls = [
//         { id: 'togglePump', key: 'bom' },
//         { id: 'toggleLight', key: 'den' },
//         { id: 'toggleSpray', key: 'phunsuong' },
//         { id: 'toggleFan', key: 'quat' },
//         { id: 'toggleShade', key: 'manche' }
//     ];

//     controls.forEach(item => {
//         document.getElementById(item.id).addEventListener('change', function() {
//             // Chỉ cho gửi khi MANUAL (currentMode === 1)
//             if (currentMode === 1) {
//                 postData('/control', {
//                     [item.key]: this.checked ? 1 : 0
//                 });
//             }
//         });
//     });
// }

// // =============================
// // CÀI ĐẶT NGƯỠNG
// // =============================
// function setupThresholdInputs() {
//     const inputs = [
//         { id: 'setTemperatureUpper', key: 'temperatureUpper' },
//         { id: 'setTemperatureLower', key: 'temperatureLower' },
//         { id: 'setHumidityUpper', key: 'humidityUpper' },
//         { id: 'setHumidityLower', key: 'humidityLower' },
//         { id: 'setSoilMoistureUpper', key: 'soilMoistureUpper' },
//         { id: 'setSoilMoistureLower', key: 'soilMoistureLower' },
//         { id: 'setLightIntensityUpper', key: 'lightIntensityUpper' },
//         { id: 'setLightIntensityLower', key: 'lightIntensityLower' }
//     ];
    
//     inputs.forEach(item => {
//         document.getElementById(item.id).addEventListener('change', function() {
//             const val = parseFloat(this.value);
//             // Kiểm tra tránh trường hợp ô input bị xóa trắng gửi lên NaN gây lỗi Server
//             if (!isNaN(val)) {
//                 postData('/thresholds', { [item.key]: val });
//             }
//         });
//     });
// }

// // =============================
// // CHUYỂN MODE
// // =============================
// function setupModeSwitch() {
//     const switchElem = document.getElementById('modeSwitch');
//     if (!switchElem) return;

//     switchElem.addEventListener('change', async function () {
//         this.setAttribute('data-user-changing', 'true');
//         const modeVal = this.checked ? 1 : 0;
        
//         await postData('/control', { mode: modeVal });
        
//         this.removeAttribute('data-user-changing');
//         refreshData();
//     });
// }

// // =============================
// // KHỞI CHẠY
// // =============================
// window.onload = function () {
//     setupDeviceControl();
//     setupThresholdInputs();
//     setupModeSwitch();

//     setInterval(refreshData, 1000);
//     refreshData();
// };

// ========================================================
// 1. BIẾN TOÀN CỤC CỦA GIAO DIỆN
// ========================================================
let sensorData = { nhietdo: 0, doamkk: 0, doamdat: 0, anhsang: 0 };
let thresholds = {};
let currentMode = 0; // 0: AUTO, 1: MANUAL
let control = { bom: 0, phunsuong: 0, den: 0, quat: 0, manche: 0 };

// Cấu hình thời gian cập nhật biểu đồ (5000ms = 5 giây)
let lastChartUpdateTime = 0; 
const CHART_UPDATE_INTERVAL = 60000; 
// ========================================================
// 2. KHỞI TẠO VÀ QUẢN LÝ WEBSOCKET
// ========================================================
let ws = null;
let reconnectTimer = null;

// Tự động lấy IP của máy tính chạy server, nếu không lấy được thì dùng IP LAN của bạn
// const SERVER_IP = window.location.hostname || "10.219.42.111"; 

// // CHỈ KHAI BÁO URL ĐẾN CỔNG 3000 (Không được dùng const ws = new WebSocket ở đây)
// const socketUrl = `ws://${SERVER_IP}:3000`; 
// Thay vì dùng SERVER_IP cứng, bạn dùng trực tiếp link từ Render
const BACKEND_URL = "datn-iot-hcmute.onrender.com";

// Kết nối WebSocket: Dùng wss (WebSocket Secure) vì Render hỗ trợ HTTPS
const socketUrl = `wss://${BACKEND_URL}`;

function connectWebSocket() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    console.log(`🔄 Đang thử kết nối tới WebSocket Server: ${socketUrl}`);

    if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        try { ws.close(); } catch(e) {}
    }

    // Khởi tạo WebSocket thực sự ở đây
    ws = new WebSocket(socketUrl);

    ws.onopen = () => {
        console.log("🟢 Đã kết nối WebSocket thành công!");
        sendWsData({ event: 'request_sync' });
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const eventType = data.event;

            switch (eventType) {
                case 'sync': 
                    console.log("🔄 Đã đồng bộ dữ liệu hệ thống:", data);
                    if (data.mode !== undefined) currentMode = Number(data.mode);
                    if (data.sensorData) sensorData = data.sensorData;
                    if (data.control) control = data.control;
                    if (data.thresholds) thresholds = data.thresholds;
                    updateAllUI();
                    break;

                case 'sensor': 
                    Object.assign(sensorData, data);
                    updateSensorUI();
                    
                    const now = Date.now();
                    if (now - lastChartUpdateTime >= CHART_UPDATE_INTERVAL) {
                        updateChartLive(data); 
                        lastChartUpdateTime = now; 
                    }
                    break;

                case 'control': 
                    Object.assign(control, data);
                    if (data.mode !== undefined) {
                        currentMode = Number(data.mode);
                    }
                    updateModeUI();
                    updateDeviceSwitches();
                    break;

                case 'threshold': 
                    Object.assign(thresholds, data);
                    updateThresholdUI();
                    break;

                case 'mode': 
                    if (data.mode !== undefined) {
                        currentMode = Number(data.mode);
                    }
                    updateModeUI();
                    updateDeviceSwitches();
                    break;
            }
        } catch (err) {
            console.error("❌ Lỗi phân tích JSON từ Server:", err);
        }
    };

    ws.onclose = () => {
        console.log("🔴 Mất kết nối WebSocket! Sẽ tự động kết nối lại sau 3 giây...");
        if (!reconnectTimer) {
            reconnectTimer = setTimeout(connectWebSocket, 3000);
        }
    };

    ws.onerror = (error) => {
        console.error("❌ Lỗi đường truyền WebSocket:", error);
    };
}

function sendWsData(dataObj) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const jsonStr = JSON.stringify(dataObj);
        ws.send(jsonStr);
        console.log("📤 Đã gửi WebSocket:", dataObj);
    } else {
        console.warn("⚠️ Không thể gửi! WebSocket chưa kết nối hoặc đã bị đóng.");
    }
}

// ========================================================
// 3. CÁC HÀM CẬP NHẬT GIAO DIỆN TRỰC QUAN (UI)
// ========================================================
function updateSensorUI() {
    if (document.getElementById('temperature')) document.getElementById('temperature').innerText = `${sensorData.nhietdo ?? 0} °C`;
    if (document.getElementById('humidity')) document.getElementById('humidity').innerText = `${sensorData.doamkk ?? 0} %`;
    if (document.getElementById('soilMoisture')) document.getElementById('soilMoisture').innerText = `${sensorData.doamdat ?? 0} %`;
    if (document.getElementById('lightIntensity')) document.getElementById('lightIntensity').innerText = `${sensorData.anhsang ?? 0} lux`;
}

function updateThresholdUI() {
    const texts = [
        { id: 'temperatureUpper', key: 'temperatureUpper', unit: '°C' },
        { id: 'temperatureLower', key: 'temperatureLower', unit: '°C' },
        { id: 'humidityUpper', key: 'humidityUpper', unit: '%' },
        { id: 'humidityLower', key: 'humidityLower', unit: '%' },
        { id: 'soilMoistureUpper', key: 'soilMoistureUpper', unit: '%' },
        { id: 'soilMoistureLower', key: 'soilMoistureLower', unit: '%' },
        { id: 'lightIntensityUpper', key: 'lightIntensityUpper', unit: 'lux' },
        { id: 'lightIntensityLower', key: 'lightIntensityLower', unit: 'lux' }
    ];

    texts.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.innerText = `${thresholds[item.key] ?? 0} ${item.unit}`;
    });

    const inputs = [
        { id: 'setTemperatureUpper', key: 'temperatureUpper' },
        { id: 'setTemperatureLower', key: 'temperatureLower' },
        { id: 'setHumidityUpper', key: 'humidityUpper' },
        { id: 'setHumidityLower', key: 'humidityLower' },
        { id: 'setSoilMoistureUpper', key: 'soilMoistureUpper' },
        { id: 'setSoilMoistureLower', key: 'soilMoistureLower' },
        { id: 'setLightIntensityUpper', key: 'lightIntensityUpper' },
        { id: 'setLightIntensityLower', key: 'lightIntensityLower' }
    ];

    inputs.forEach(item => {
        const inputEl = document.getElementById(item.id);
        if (inputEl && document.activeElement !== inputEl) {
            if (thresholds[item.key] !== undefined) {
                inputEl.value = thresholds[item.key];
            }
        }
    });
}

function updateDeviceSwitches() {
    const deviceIds = [
        { id: 'togglePump', key: 'bom' },
        { id: 'toggleSpray', key: 'phunsuong' },
        { id: 'toggleLight', key: 'den' },
        { id: 'toggleFan', key: 'quat' },
        { id: 'toggleShade', key: 'manche' }
    ];

    const isAuto = Number(currentMode) === 0;

    deviceIds.forEach(item => {
        const el = document.getElementById(item.id);
        if (!el) return;

        if (el.matches(':active')) return;

        const isTurnedOn = control[item.key] === 1;
        if (el.checked !== isTurnedOn) {
            el.checked = isTurnedOn;
        }

        el.disabled = isAuto;
    });
}

function updateModeUI() {
    const modeSwitch = document.getElementById('modeSwitch');
    if (modeSwitch && document.activeElement !== modeSwitch) {
        modeSwitch.checked = currentMode === 1; 
    }
}

function updateAllUI() {
    updateSensorUI();
    updateThresholdUI();
    updateModeUI();
    updateDeviceSwitches();
}

// ========================================================
// 4. LẮNG NGHE CÁC SỰ KIỆN THAO TÁC TRÊN MÀN HÌNH (UI EVENTS)
// ========================================================
function setupDeviceControl() {
    const controls = [
        { id: 'togglePump', key: 'bom' },
        { id: 'toggleLight', key: 'den' },
        { id: 'toggleSpray', key: 'phunsuong' },
        { id: 'toggleFan', key: 'quat' },
        { id: 'toggleShade', key: 'manche' }
    ];

    controls.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.addEventListener('change', function () {
                if (currentMode === 1) {
                    control[item.key] = this.checked ? 1 : 0;
                    
                    sendWsData({ 
                        event: 'control', 
                        bom: control.bom,
                        phunsuong: control.phunsuong,
                        den: control.den,
                        quat: control.quat,
                        manche: control.manche
                    });
                } else {
                    this.checked = control[item.key] === 1;
                    alert("Hệ thống đang ở chế độ TỰ ĐỘNG (AUTO). Vui lòng chuyển sang thủ công để điều khiển!");
                }
            });
        }
    });
}

function setupThresholdInputs() {
    const inputs = [
        { id: 'setTemperatureUpper', key: 'temperatureUpper' },
        { id: 'setTemperatureLower', key: 'temperatureLower' },
        { id: 'setHumidityUpper', key: 'humidityUpper' },
        { id: 'setHumidityLower', key: 'humidityLower' },
        { id: 'setSoilMoistureUpper', key: 'soilMoistureUpper' },
        { id: 'setSoilMoistureLower', key: 'soilMoistureLower' },
        { id: 'setLightIntensityUpper', key: 'lightIntensityUpper' },
        { id: 'setLightIntensityLower', key: 'lightIntensityLower' }
    ];

    inputs.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.addEventListener('change', function () {
                const val = parseFloat(this.value);
                if (!isNaN(val)) {
                    thresholds[item.key] = val;
                    updateThresholdUI();
                    
                    sendWsData({
                        event: 'threshold',
                        [item.key]: val
                    });
                }
            });
        }
    });
}

function setupModeSwitch() {
    const switchElem = document.getElementById('modeSwitch');
    if (switchElem) {
        switchElem.addEventListener('change', function () {
            const modeVal = this.checked ? 1 : 0;
            currentMode = modeVal;
            
            updateDeviceSwitches();
            sendWsData({ event: 'mode', mode: modeVal });
        });
    }
}

// ========================================================
// 5. QUẢN LÝ BIỂU ĐỒ (CHART.JS)
// ========================================================
let myChart = null;
// ĐỔI MỚI: Thêm biến lưu ngày hiện tại của biểu đồ (Định dạng DD/MM/YYYY)
let currentChartDate = new Date().toLocaleDateString('vi-VN'); 
const API_URL = `${BACKEND_URL}/api/history`;

// Hàm kéo toàn bộ dữ liệu lịch sử và vẽ biểu đồ lần đầu
async function loadAndDrawChart() {
    const canvas = document.getElementById('sensorChart');
    if (!canvas) return;

    try {
        const response = await fetch(`${API_URL}?t=${new Date().getTime()}`, { 
            cache: 'no-store' 
        });
        const historyData = await response.json();

        const labels = [];
        const nhietDoData = [];
        const doAmKKData = [];
        const doAmDatData = [];
        const anhSangData = []; 

        // ĐỔI MỚI: Lấy chuỗi ngày hôm nay để so sánh
        const todayStr = new Date().toLocaleDateString('vi-VN');
        currentChartDate = todayStr; // Đồng bộ lại mốc ngày hiện tại

        historyData.forEach(item => {
            const dateObj = new Date(item.created_at);
            const itemDateStr = dateObj.toLocaleDateString('vi-VN');

            // LỌC: Chỉ đẩy vào mảng vẽ biểu đồ nếu dữ liệu trùng với ngày hôm nay
            if (itemDateStr === todayStr) {
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                labels.push(timeStr);
                nhietDoData.push(item.nhietdo);
                doAmKKData.push(item.doamkk);
                doAmDatData.push(item.doamdat);
                anhSangData.push(item.anhsang || 0); 
            }
        });

        if (myChart) {
            myChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Nhiệt độ (°C)',
                        data: nhietDoData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        yAxisID: 'y',
                        tension: 0.3
                    },
                    {
                        label: 'Độ ẩm KK (%)',
                        data: doAmKKData,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.3
                    },
                    {
                        label: 'Độ ẩm Đất (%)',
                        data: doAmDatData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.3
                    },
                    {
                        label: 'Ánh sáng (Lux)',
                        data: anhSangData,
                        borderColor: 'rgb(255, 205, 86)',
                        backgroundColor: 'rgba(255, 205, 86, 0.1)',
                        yAxisID: 'y2', 
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: { display: true, text: 'Thời gian' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Nhiệt độ (°C)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Độ ẩm (%)' },
                        grid: { drawOnChartArea: false } 
                    },
                    y2: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Ánh sáng (Lux)' },
                        grid: { drawOnChartArea: false } 
                    }
                }
            }
        });
        console.log(`📊 Đã hiển thị dữ liệu lịch sử của ngày hôm nay (${todayStr})!`);

    } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu biểu đồ:", error);
    }
}

// Hàm bổ sung thêm điểm dữ liệu mới vào biểu đồ theo thời gian thực (Đã tối ưu)
function updateChartLive(newData) {
    if (!myChart) return; 
    
    const now = new Date();
    const todayStr = now.toLocaleDateString('vi-VN');
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // ĐỔI MỚI: KIỂM TRA SANG NGÀY MỚI (QUA 12H ĐÊM) -> RESET TRẮNG BIỂU ĐỒ
    if (todayStr !== currentChartDate) {
        console.log("📅 Đã bước sang ngày mới! Tiến hành reset biểu đồ...");
        myChart.data.labels = []; // Xóa hết mốc thời gian cũ
        myChart.data.datasets.forEach(dataset => {
            dataset.data = []; // Xóa hết dữ liệu các cột cảm biến cũ
        });
        currentChartDate = todayStr; // Cập nhật mốc ngày mới
    }
    
    // Thêm dữ liệu thời gian thực mới vào cuối mảng
    myChart.data.labels.push(timeStr);
    myChart.data.datasets[0].data.push(newData.nhietdo);
    myChart.data.datasets[1].data.push(newData.doamkk);
    myChart.data.datasets[2].data.push(newData.doamdat);
    myChart.data.datasets[3].data.push(newData.anhsang || 0); 
    
    // 💡 LƯU Ý: Đoạn code xóa điểm đầu tiên (.shift()) cũ đã được loại bỏ 
    // nhằm mục đích lưu giữ toàn bộ các điểm dữ liệu trong ngày không bị mất đi.
    
    // Yêu cầu Chart.js vẽ lại trục đồ thị mới
    myChart.update();
}
// ========================================================
// 6. XUẤT DỮ LIỆU RA EXCEL
// ========================================================
async function exportDataToExcel() {
    try {
        console.log("Đang tải dữ liệu để xuất Excel...");
        
        // 1. Gọi API lấy toàn bộ dữ liệu lịch sử (thêm timestamp để chống cache)
        const response = await fetch(`${API_URL}?t=${new Date().getTime()}`, { 
            cache: 'no-store' 
        });
        const historyData = await response.json();

        if (!historyData || historyData.length === 0) {
            alert("Không có dữ liệu trong Database để xuất!");
            return;
        }

        // --- ĐỔI MỚI: TÍNH TOÁN VÀ LỌC DỮ LIỆU TRONG 7 NGÀY ---
        const now = new Date();
        // Lùi lại 7 ngày (7 ngày * 24 giờ * 60 phút * 60 giây * 1000 mili-giây)
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        const filteredData = historyData.filter(item => {
            const itemDate = new Date(item.created_at);
            // Chỉ giữ lại các dữ liệu lớn hơn hoặc bằng mốc 7 ngày trước
            return itemDate >= sevenDaysAgo && itemDate <= now;
        });

        // Kiểm tra xem sau khi lọc có còn dữ liệu không
        if (filteredData.length === 0) {
            alert("Không có dữ liệu nào trong 7 ngày gần nhất để xuất!");
            return;
        }
        // -----------------------------------------------------

        // 2. Format lại dữ liệu đã lọc: Đổi tên cột sang tiếng Việt và chỉnh format thời gian
        const formattedData = filteredData.map((item, index) => {
            const dateObj = new Date(item.created_at);
            return {
                "STT": index + 1,
                "Thời gian": dateObj.toLocaleString('vi-VN'), // Định dạng ngày giờ Việt Nam
                "Nhiệt độ (°C)": item.nhietdo,
                "Độ ẩm không khí (%)": item.doamkk,
                "Độ ẩm đất (%)": item.doamdat,
                "Ánh sáng (lux)": item.anhsang || 0
            };
        });

        // 3. Tạo file Excel bằng thư viện XLSX (SheetJS)
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        
        // Tùy chỉnh độ rộng của các cột trong Excel cho đẹp
        const wscols = [
            {wch: 5},  // STT
            {wch: 25}, // Thời gian
            {wch: 15}, // Nhiệt độ
            {wch: 25}, // Độ ẩm không khí
            {wch: 20}, // Độ ẩm đất
            {wch: 15}  // Ánh sáng
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Lịch sử cảm biến");

        // 4. Đặt tên file có chứa ngày tháng hiện tại (Có đệm số 0 cho đẹp mắt)
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const date = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const mins = now.getMinutes().toString().padStart(2, '0');
        
        const fileName = `DuLieu_CamBien_7Ngay_${now.getFullYear()}${month}${date}_${hours}h${mins}.xlsx`;

        // 5. Kích hoạt tải xuống
        XLSX.writeFile(workbook, fileName);
        console.log("✅ Đã xuất file Excel (dữ liệu 7 ngày) thành công!");

    } catch (error) {
        console.error("❌ Lỗi khi xuất Excel:", error);
        alert("Có lỗi xảy ra khi lấy dữ liệu xuất Excel. Hãy kiểm tra lại kết nối mạng hoặc Server!");
    }
}
// ========================================================
// 7. KHỞI CHẠY KHI MỞ TRANG WEB
// ========================================================
window.onload = function () {
    setupDeviceControl();
    setupThresholdInputs();
    setupModeSwitch();
    
    // Bắt đầu kết nối WebSocket liên tục
    connectWebSocket();

    // Tải biểu đồ lần đầu tiên
    loadAndDrawChart();

    // Vẫn giữ lại timer đồng bộ cứng 5 phút phòng trường hợp lỗi mạng rớt WebSocket
    setInterval(() => {
        console.log("⏰ Đồng bộ lại toàn bộ dữ liệu biểu đồ (chu kỳ 5 phút)...");
        loadAndDrawChart();
    }, 300000);
    const btnExport = document.getElementById('btnExportExcel');
    if (btnExport) {
        btnExport.addEventListener('click', exportDataToExcel);
    }
};