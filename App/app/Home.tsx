import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Đổi cổng kết nối sang cổng WebSocket Server (Ví dụ: 8084)
const BACKEND_URL = "datn-iot-hcmute.onrender.com"; // Bỏ https://
const WS_URL = `wss://${BACKEND_URL}`;           // Kết quả: wss://datn-iot-hcmute.onrender.com

const HomeScreen = () => {

  // =============================
  // 1. KHAI BÁO BIẾN (STATE & REF)
  // =============================
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });

  const [deviceState, setDeviceState] = useState({
    pump: false,
    light: false,
    spray: false,
    fan: false,
    shade: false, 
  });

  const [thresholdInputs, setThresholdInputs] = useState({
    temperatureLower: '0',
    temperatureUpper: '0',
    humidityLower: '0',
    humidityUpper: '0',
    soilMoistureLower: '0',
    soilMoistureUpper: '0',
    lightIntensityLower: '0',
    lightIntensityUpper: '0',
  });

  const [mode, setMode] = useState(0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Dùng Ref để lưu trữ WebSocket instance và giá trị focus hiện tại mà không làm loop kết nối
  const wsRef = useRef<WebSocket | null>(null);
  const focusedInputRef = useRef<string | null>(null);
  const reconnectTimeoutRef =
  useRef<ReturnType<typeof setTimeout> | null>(null);

  // Luôn đồng bộ giá trị focusedInput vào Ref để luồng WebSocket đọc được giá trị mới nhất
  useEffect(() => {
    focusedInputRef.current = focusedInput;
  }, [focusedInput]);

// =============================
// 2. QUẢN LÝ KẾT NỐI WEBSOCKET REAL-TIME (ĐÃ FIX LỖI LẶP KẾT NỐI)
// =============================
useEffect(() => {
  const connectWS = () => {
    console.log("🔄 Đang kết nối tới WebSocket Server...");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 Đã kết nối thành công WebSocket tới Server!");
      ws.send(JSON.stringify({ event: "request_sync" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📥 Nhận dữ liệu từ Server:", data);
        const eventType = data.event;

        switch (eventType) {
          case 'sync': // Đồng bộ tổng thể từ bộ nhớ RAM của Server
            if (data.mode !== undefined) setMode(data.mode);
            if (data.sensorData) {
              setSensorData({
                temperature: data.sensorData.nhietdo ?? 0,
                humidity: data.sensorData.doamkk ?? 0,
                soilMoisture: data.sensorData.doamdat ?? 0,
                lightIntensity: data.sensorData.anhsang ?? 0,
              });
            }
            if (data.control) {
              setDeviceState({
                pump: data.control.bom === 1,
                light: data.control.den === 1,
                spray: data.control.phunsuong === 1,
                fan: data.control.quat === 1,
                shade: data.control.manche === 1,
              });
            }
            if (data.thresholds) {
              setThresholdInputs(prev => {
                const next = { ...prev };
                Object.keys(data.thresholds).forEach((key) => {
                  if (focusedInputRef.current !== key) {
                    next[key as keyof typeof prev] = String(data.thresholds[key]);
                  }
                });
                return next;
              });
            }
            break;
            
            case 'device_status':
            console.log("📥 App cập nhật trạng thái thực tế từ ESP32:", data);
            if (data.mode !== undefined) setMode(data.mode);
            if (data.control) {
              setDeviceState({
                pump: data.control.bom === 1,
                light: data.control.den === 1,
                spray: data.control.phunsuong === 1,
                fan: data.control.quat === 1,
                shade: data.control.manche === 1,
              });
            }
          break;

          case 'sensor': 
            setSensorData({
              temperature: data.nhietdo ?? 0,
              humidity: data.doamkk ?? 0,
              soilMoisture: data.doamdat ?? 0,
              lightIntensity: data.anhsang ?? 0,
            });
            break;

          case 'control': 
            setDeviceState(prev => ({
              ...prev,
              ...(data.bom !== undefined && { pump: data.bom === 1 }),
              ...(data.den !== undefined && { light: data.den === 1 }),
              ...(data.phunsuong !== undefined && { spray: data.phunsuong === 1 }),
              ...(data.quat !== undefined && { fan: data.quat === 1 }),
              ...(data.manche !== undefined && { shade: data.manche === 1 })
            }));
            break;

          case 'threshold': 
            setThresholdInputs(prev => {
              const next = { ...prev };
              Object.keys(data).forEach((key) => {
                if (key !== 'event' && focusedInputRef.current !== key && key in next) {
                  next[key as keyof typeof prev] = String(data[key]);
                }
              });
              return next;
            });
            break;

          case 'mode': 
            if (data.mode !== undefined) setMode(data.mode);
            break;
        }
      } catch (err) {
        console.log("❌ Lỗi phân tích JSON từ WS:", err);
      }
    };

    ws.onclose = () => {
      console.log("🔴 Mất kết nối WebSocket. Đang thử kết nối lại sau 3 giây...");
      
      // 🔥 FIX 1: Hủy các listener của chính kết nối vừa đóng để tránh gọi chồng chéo
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        connectWS();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.log("❌ Lỗi đường truyền WebSocket:", error);
      ws.close();
    };
  };

  connectWS();

  // Hủy kết nối và dọn dẹp bộ nhớ khi tắt màn hình (Unmount Component)
  return () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // 🔥 FIX 2: Tắt biểu thức lắng nghe onclose trước rồi mới đóng hẳn để chặn đứng reconnect ngầm
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null; 
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
      console.log("🧹 Đã dọn dẹp sạch kết nối WebSocket cũ chống trùng lặp.");
    }
  };
}, []);

  // =============================
  // 3. CÁC HÀM GỬI LỆNH QUA WEBSOCKET (FUNCTIONS)
  // =============================
  
  // Hàm trung gian gửi dữ liệu an toàn
  const sendWebSocketData = (payload: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      Alert.alert("Thông báo", "Ứng dụng đang mất kết nối tạm thời tới máy chủ!");
    }
  };

  // Hàm bật/tắt thiết bị thủ công
  const handleDeviceToggle = (device: string, value: boolean) => {
    if (mode === 0) return;

    // Cập nhật giao diện local ngay lập tức (Optimistic UI) để tạo cảm giác mượt mà
    const stateKey = 
      device === 'bom' ? 'pump' :
      device === 'den' ? 'light' :
      device === 'phunsuong' ? 'spray' :
      device === 'manche' ? 'shade' : 'fan';

    setDeviceState(prev => ({ ...prev, [stateKey]: value }));

    // Bắn dữ liệu điều khiển qua WebSocket
    sendWebSocketData({ 
      event: 'control', 
      [device]: value ? 1 : 0 
    });
  };

  // Hàm lưu tạm giá trị ngưỡng khi đang gõ phím
  const handleThresholdTyping = (thresholdKey: string, value: string) => {
    setThresholdInputs(prev => ({ ...prev, [thresholdKey]: value }));
  };

  // Hàm gửi cấu hình ngưỡng lên server khi người dùng gõ xong (Nhấn Done/bấm ra ngoài)
  const handleThresholdSave = (thresholdKey: string, value: string) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return; 

    // Bắn dữ liệu cập nhật ngưỡng qua WebSocket
    sendWebSocketData({ 
      event: 'threshold', 
      [thresholdKey]: numberValue 
    });
  };

  // Hàm chuyển đổi chế độ Auto/Manual
  const toggleMode = (value: boolean) => {
    const nextMode = value ? 1 : 0;
    setMode(nextMode);

    // Bắn sự kiện thay đổi mode qua WebSocket
    sendWebSocketData({ 
      event: 'mode', 
      mode: nextMode 
    });
  };

  // ĐÃ FIX: Hàm đăng xuất dọn dẹp triệt để kết nối WebSocket cũ
    const handleLogout = () => {

    if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
    }

    router.replace('/login');
    };

  // =============================
  // 4. GIAO DIỆN (UI - GIỮ NGUYÊN)
  // =============================
return (
    <ScrollView style={styles.mainWrapper} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/images/logo_hcmute.png')} style={styles.logo} />
        <Text style={styles.schoolName}>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT{"\n"}THÀNH PHỐ HỒ CHÍ MINH</Text>
        <View style={styles.badgeTitle}>
          <Text style={styles.projectTitle}>ĐỒ ÁN TỐT NGHIỆP</Text>
        </View>
        <Text style={styles.projectDesc}>THIẾT KẾ MÔ HÌNH HỆ THỐNG TƯỚI TIÊU TỰ ĐỘNG TÍCH HỢP NĂNG LƯỢNG MẶT TRỜI</Text>
      </View>

      {/* SYSTEM MODE CONTROL */}
      <View style={styles.modeCard}>
        <View style={styles.modeInfo}>
          <MaterialCommunityIcons name="cog-outline" size={28} color="#1b5e20" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.modeLabel}>MODE</Text>
            <Text style={styles.modeStatus}>
              {mode === 0 ? 'AUTO' : 'MANUAL'}
            </Text>
          </View>
        </View>
        <Switch
          value={mode === 1}
          onValueChange={toggleMode}
          trackColor={{ false: "#b0bec5", true: "#a5d6a7" }}
          thumbColor={mode === 1 ? "#2e7d32" : "#f5f5f5"}
        />
      </View>

      {/* ================= THÙNG 1: GIÁ TRỊ CẢM BIẾN ================= */}
      <View style={styles.mainContainerWrapper}>
        <Text style={styles.boxSectionTitle}>DISPLAY SENSOR VALUE</Text>
        
        <View style={styles.sensorGrid}>
          
          {/* Ô Nhiệt độ */}
          <View style={styles.sensorCard}>
            <Text style={styles.metricName}>🌡️ Temperature</Text>
            <Text style={styles.metricValue}>
              {sensorData.temperature}<Text style={styles.unitText}>°C</Text>
            </Text>
          </View>

          {/* Ô Độ ẩm Không khí */}
          <View style={styles.sensorCard}>
            {/* Tách cụm tiêu đề thành một hàng ngang, hạ nhẹ size chữ xuống 11.5 để bao vừa vặn */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'center', width: '100%' }}>
              <Text style={{ fontSize: 12, marginRight: 2 }}>💧</Text>
              <Text style={{ fontSize: 11.5, color: '#757575', fontWeight: '600' }} numberOfLines={1}>
                Air Humidity
              </Text>
            </View>
            
            <Text style={styles.metricValue}>
              {sensorData.humidity}<Text style={styles.unitText}>%</Text>
            </Text>
          </View>

          {/* Ô Độ ẩm Đất */}
          <View style={styles.sensorCard}>
            <Text style={styles.metricName}>🪴 Soil Moisture</Text>
            <Text style={styles.metricValue}>
              {sensorData.soilMoisture}<Text style={styles.unitText}>%</Text>
            </Text>
          </View>

          {/* Ô Ánh sáng */}
          <View style={styles.sensorCard}>
            <Text style={styles.metricName}>☀️ Light Intensity</Text>
            <Text style={styles.metricValue}>
              {sensorData.lightIntensity}<Text style={styles.unitText}> lux</Text>
            </Text>
          </View>

        </View>
      </View>

      {/* ================= THÙNG 2: CÀI ĐẶT NGƯỠNG TỰ ĐỘNG ================= */}
      <View style={styles.mainContainerWrapper}>
        <Text style={styles.boxSectionTitle}>SETTING VALUES</Text>
        
        <View style={styles.thresholdsBox}>
          <View style={styles.thresholdHeader}>
            <Text style={[styles.thHeaderLabel, { flex: 1 }]}></Text>
            <Text style={[styles.thHeaderLabel, { flex: 1, textAlign: 'center' }]}>Low Threshold</Text>
            <Text style={[styles.thHeaderLabel, { flex: 1, textAlign: 'center' }]}>High Threshold</Text>
          </View>

          {/* NHIỆT ĐỘ */}
          <View style={styles.thresholdRow}>
            <View style={styles.thLabelContainer}>
              {/* <MaterialCommunityIcons name="thermometer" size={18} color="#e53935" /> */}
              <Text style={styles.thLabelText}>Temperature (°C)</Text>
            </View>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.temperatureLower}
              onChangeText={(txt) => handleThresholdTyping('temperatureLower', txt)}
              onFocus={() => setFocusedInput('temperatureLower')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('temperatureLower', e.nativeEvent.text)}
            />
            <Text style={styles.thSeparator}>-</Text>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.temperatureUpper}
              onChangeText={(txt) => handleThresholdTyping('temperatureUpper', txt)}
              onFocus={() => setFocusedInput('temperatureUpper')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('temperatureUpper', e.nativeEvent.text)}
            />
          </View>

          {/* ĐỘ ẨM KHÔNG KHÍ */}
          <View style={styles.thresholdRow}>
            <View style={styles.thLabelContainer}>
              {/* <MaterialCommunityIcons name="water-percent" size={18} color="#1e88e5" /> */}
              <Text style={styles.thLabelText}>Air Humidity (%)</Text>
            </View>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.humidityLower}
              onChangeText={(txt) => handleThresholdTyping('humidityLower', txt)}
              onFocus={() => setFocusedInput('humidityLower')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('humidityLower', e.nativeEvent.text)}
            />
            <Text style={styles.thSeparator}>-</Text>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.humidityUpper}
              onChangeText={(txt) => handleThresholdTyping('humidityUpper', txt)}
              onFocus={() => setFocusedInput('humidityUpper')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('humidityUpper', e.nativeEvent.text)}
            />
          </View>

          {/* ĐỘ ẨM ĐẤT */}
          <View style={styles.thresholdRow}>
            <View style={styles.thLabelContainer}>
              {/* <MaterialCommunityIcons name="sprout" size={18} color="#6d4c41" /> */}
              <Text style={styles.thLabelText}>Soil Moisture (%)</Text>
            </View>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.soilMoistureLower}
              onChangeText={(txt) => handleThresholdTyping('soilMoistureLower', txt)}
              onFocus={() => setFocusedInput('soilMoistureLower')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('soilMoistureLower', e.nativeEvent.text)}
            />
            <Text style={styles.thSeparator}>-</Text>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.soilMoistureUpper}
              onChangeText={(txt) => handleThresholdTyping('soilMoistureUpper', txt)}
              onFocus={() => setFocusedInput('soilMoistureUpper')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('soilMoistureUpper', e.nativeEvent.text)}
            />
          </View>

          {/* ÁNH SÁNG */}
          <View style={styles.thresholdRow}>
            <View style={styles.thLabelContainer}>
              {/* <MaterialCommunityIcons name="weather-sunny" size={18} color="#fbc02d" /> */}
              <Text style={styles.thLabelText}>Light Intensity(lux)</Text>
            </View>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.lightIntensityLower}
              onChangeText={(txt) => handleThresholdTyping('lightIntensityLower', txt)}
              onFocus={() => setFocusedInput('lightIntensityLower')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('lightIntensityLower', e.nativeEvent.text)}
            />
            <Text style={styles.thSeparator}>-</Text>
            <TextInput
              style={styles.thInput}
              keyboardType="numeric"
              value={thresholdInputs.lightIntensityUpper}
              onChangeText={(txt) => handleThresholdTyping('lightIntensityUpper', txt)}
              onFocus={() => setFocusedInput('lightIntensityUpper')}
              onBlur={() => setFocusedInput(null)}
              onEndEditing={(e) => handleThresholdSave('lightIntensityUpper', e.nativeEvent.text)}
            />
          </View>
        </View>
      </View>

      {/* ================= THÙNG 3: ĐIỀU KHIỂN THIẾT BỊ THỦ CÔNG ================= */}
      <View style={styles.mainContainerWrapper}>
        <Text style={styles.boxSectionTitle}>DEVICE CONTROL</Text>
        
        {mode === 0 && (
          <Text style={styles.disabledWarning}>* Switch to Manual mode to control devices</Text>
        )}

        <View style={styles.deviceGrid}>
          
          {/* Bơm tưới */}
          <View style={[styles.newDeviceCard, deviceState.pump && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
            <Text style={[styles.newDeviceLabel, deviceState.pump && styles.textActive]}>🚰 Irrigation Pump</Text>
            <Switch
              value={deviceState.pump}
              onValueChange={value => handleDeviceToggle('bom', value)}
              disabled={mode === 0}
              trackColor={{ false: "#eeeeee", true: "#90caf9" }}
              thumbColor={deviceState.pump ? "#2196F3" : "#bdbdbd"}
            />
          </View>

          {/* Phun sương */}
          <View style={[styles.newDeviceCard, deviceState.spray && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
            <Text style={[styles.newDeviceLabel, deviceState.spray && styles.textActive]}>🌫️ Misting Pump</Text>
            <Switch
              value={deviceState.spray}
              onValueChange={value => handleDeviceToggle('phunsuong', value)}
              disabled={mode === 0}
              trackColor={{ false: "#eeeeee", true: "#80deea" }}
              thumbColor={deviceState.spray ? "#00bcd4" : "#bdbdbd"}
            />
          </View>

          {/* Đèn chiếu sáng */}
          <View style={[styles.newDeviceCard, deviceState.light && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
            <Text style={[styles.newDeviceLabel, deviceState.light && styles.textActive]}>💡Light</Text>
            <Switch
              value={deviceState.light}
              onValueChange={value => handleDeviceToggle('den', value)}
              disabled={mode === 0}
              trackColor={{ false: "#eeeeee", true: "#ffe082" }}
              thumbColor={deviceState.light ? "#fbc02d" : "#bdbdbd"}
            />
          </View>

          {/* Quạt tản nhiệt */}
          <View style={[styles.newDeviceCard, deviceState.fan && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
            <Text style={[styles.newDeviceLabel, deviceState.fan && styles.textActive]}>🌀 Fan</Text>
            <Switch
              value={deviceState.fan}
              onValueChange={value => handleDeviceToggle('quat', value)}
              disabled={mode === 0}
              trackColor={{ false: "#eeeeee", true: "#ffab91" }}
              thumbColor={deviceState.fan ? "#ff5722" : "#bdbdbd"}
            />
          </View>
          
          {/* Màn che */}
          <View style={[styles.newDeviceCard, deviceState.shade && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
            <Text style={[styles.newDeviceLabel, deviceState.shade && styles.textActive]}>⛺ Shade</Text>
            <Switch
              value={deviceState.shade}
              onValueChange={value => handleDeviceToggle('manche', value)} 
              disabled={mode === 0}
              trackColor={{ false: "#eeeeee", true: "#9fa8da" }}
              thumbColor={deviceState.shade ? "#3f51b5" : "#bdbdbd"}
            />
          </View>

        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialCommunityIcons name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

// =============================
// 5. STYLES (GIỮ NGUYÊN CSS)
// =============================
const styles = StyleSheet.create({
  mainWrapper: { 
    flex: 1, 
    backgroundColor: '#f4f6f9' 
  },
  container: { 
    padding: 16, 
    alignItems: 'center' 
  },
  headerContainer: { 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    width: '100%', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2 
  },
  logo: { 
    width: 75, 
    height: 75, 
    marginBottom: 12, 
    resizeMode: 'contain' 
  },
  schoolName: { 
    fontWeight: '800', 
    fontSize: 13, 
    textAlign: 'center', 
    color: '#0d47a1', 
    lineHeight: 18, 
    letterSpacing: 0.3 
  },
  badgeTitle: { 
    backgroundColor: '#e8f5e9', 
    paddingHorizontal: 14, 
    paddingVertical: 4, 
    borderRadius: 20, 
    marginTop: 10, 
    marginBottom: 6 
  },
  projectTitle: { 
    fontWeight: '900', 
    fontSize: 15, 
    color: '#2e7d32', 
    textAlign: 'center' 
  },
  projectDesc: { 
    fontWeight: '700', 
    fontSize: 13, 
    color: '#424242', 
    textAlign: 'center', 
    paddingHorizontal: 10, 
    lineHeight: 18 
  },
  modeCard: { 
    flexDirection: 'row', 
    backgroundColor: '#e8f5e9', 
    width: '100%', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderWidth: 1, 
    borderColor: '#c8e6c9', 
    marginBottom: 16 
  },
  modeInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  modeLabel: { 
    fontSize: 12, 
    color: '#4caf50', 
    fontWeight: '600' 
  },
  modeStatus: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#1b5e20', 
    marginTop: 1 
  },

  /* ================= CSS CÁI THÙNG BAO QUANH CHUNG ================= */
  mainContainerWrapper: {
    backgroundColor: '#FFFFFF',    // Đổi thành nền trắng để các ô con bên trong nổi bật lên hẳn
    borderWidth: 1,              
    borderColor: '#e2e8f0',        
    borderRadius: 20,              
    paddingHorizontal: 14,         // Khoảng đệm bên trong thùng (trái/phải)
    paddingVertical: 16,           // Khoảng đệm bên trong thùng (trên/dưới)
    marginVertical: 10,            // Khoảng cách giãn giữa các thùng với nhau
    alignSelf: 'stretch',          // Tự co giãn an toàn theo chiều ngang, không lo lỗi biến width
    
    // Đổ bóng cho chiếc thùng lớn
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,                  
  },

  /* ================= TIÊU ĐỀ ĐẦU MỖI CÁI THÙNG ================= */
/* ================= TIÊU ĐỀ ĐẦU MỖI CÁI THÙNG ================= */
  boxSectionTitle: {
    alignSelf: 'center',           // ĐỔI TỪ 'flex-start' THÀNH 'center' để đưa cả khối vào giữa
    textAlign: 'center',           // THÊM DÒNG NÀY để căn giữa nội dung chữ bên trong
    fontWeight: '800', 
    fontSize: 15, 
    color: '#263238', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
    marginBottom: 14, 
    // paddingLeft: 2,             // XÓA HOẶC ẨN DÒNG NÀY ĐI để chữ không bị lệch sang phải một chút
  },

  disabledWarning: { 
    alignSelf: 'flex-start', 
    fontSize: 12, 
    color: '#e53935', 
    fontWeight: '600', 
    marginTop: -8, 
    marginBottom: 12, 
    paddingLeft: 4 
  },

  /* ================= NỘI DUNG THÙNG 1: SENSOR ================= */
  sensorGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  sensorCard: { 
    width: '48%', 
    backgroundColor: '#f8fafc',    // Đổi sang màu xám cực nhẹ để phân biệt với nền thùng trắng
    borderRadius: 16, 
    padding: 14, 
    marginBottom: 12, 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  iconWrapper: { 
    width: 46, 
    height: 46, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 10 
  },
  metricName: { 
    fontSize: 12, 
    color: '#757575', 
    fontWeight: '600', 
    marginBottom: 4 
  },
  metricValue: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#212121' 
  },
  unitText: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: '#757575' 
  },

  /* ================= NỘI DUNG THÙNG 2: THRESHOLDS ================= */
  thresholdsBox: { 
    width: '100%' 
  },
  thresholdHeader: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eeeeee', 
    paddingBottom: 8, 
    marginBottom: 12 
  },
  thHeaderLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#9e9e9e', 
    textTransform: 'uppercase' 
  },
  thresholdRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  thLabelContainer: { 
    flex: 1.5, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  thLabelText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#424242', 
    marginLeft: 6 
  },
  thInput: { 
    flex: 1, 
    height: 36, 
    backgroundColor: '#f5f5f5', 
    borderRadius: 8, 
    textAlign: 'center', 
    fontWeight: '700', 
    color: '#2e7d32', 
    borderWidth: 1, 
    borderColor: '#e0e0e0' 
  },
  thSeparator: { 
    marginHorizontal: 8, 
    color: '#9e9e9e', 
    fontWeight: '700' 
  },

  /* ================= NỘI DUNG THÙNG 3: DEVICES ================= */
  deviceGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  newDeviceCard: { 
    width: '48%', 
    backgroundColor: '#f8fafc',    // Đổi sang màu xám nhẹ tương tự ô cảm biến
    borderRadius: 18, 
    padding: 14, 
    marginBottom: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  deviceCardActive: { 
    backgroundColor: '#e8f5e9', 
    borderColor: '#a5d6a7' 
  },
  deviceCardDisabled: { 
    opacity: 0.65, 
    backgroundColor: '#edf2f7' 
  },
  deviceIconCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  newDeviceLabel: { 
    fontWeight: '700', 
    fontSize: 13, 
    color: '#455a64', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  textActive: { 
    color: '#1b5e20' 
  },

  /* ================= NÚT ĐĂNG XUẤT NẰM NGOÀI THÙNG ================= */
  logoutButton: { 
    flexDirection: 'row', 
    backgroundColor: '#e53935', 
    width: '100%', 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15, 
    marginBottom: 20, 
    shadowColor: '#e53935', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 3 
  },
  logoutButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});

export default HomeScreen;