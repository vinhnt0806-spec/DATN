import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL = "http://10.219.42.111:3000";

const HomeScreen = () => {

  // =============================
  // 1. KHAI BÁO BIẾN (STATE)
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

  // State theo dõi xem người dùng đang gõ ô nào để tạm dừng ghi đè từ setInterval
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [mode, setMode] = useState(0);

  // =============================
  // 2. LẤY DỮ LIỆU TỪ SERVER (TỰ ĐỘNG ĐỒNG BỘ)
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/data`);
        const data = await response.json();

        // Cập nhật Cảm biến
        setSensorData({
          temperature: data.sensorData?.nhietdo ?? 0,
          humidity: data.sensorData?.doamkk ?? 0,
          soilMoisture: data.sensorData?.doamdat ?? 0,
          lightIntensity: data.sensorData?.anhsang ?? 0,
        });

        // Cập nhật Trạng thái thiết bị
        setDeviceState({
          pump: data.control?.bom === 1,
          light: data.control?.den === 1,
          spray: data.control?.phunsuong === 1,
          fan: data.control?.quat === 1,
          shade: data.control?.manche === 1, // Đã đồng bộ key 'manche' từ server
        });

        // Cập nhật Ngưỡng có kèm bẫy check focusedInput chống giật đè chữ
        setThresholdInputs(prev => {
          const next = { ...prev };
          const keys = [
            'temperatureLower', 'temperatureUpper',
            'humidityLower', 'humidityUpper',
            'soilMoistureLower', 'soilMoistureUpper',
            'lightIntensityLower', 'lightIntensityUpper'
          ] as const;

          keys.forEach(key => {
            // Chỉ cập nhật từ server xuống nếu user KHÔNG ĐANG FOCUS gõ ô này
            if (focusedInput !== key) {
              next[key] = String(data.thresholds?.[key] ?? prev[key]);
            }
          });
          return next;
        });

        // Cập nhật Chế độ
        setMode(data.system?.mode ?? 0);

      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [focusedInput]); 

  // =============================
  // 3. CÁC HÀM XỬ LÝ (FUNCTIONS)
  // =============================
  
  // Hàm bật/tắt thiết bị thủ công
  const handleDeviceToggle = async (device: string, value: boolean) => {
    if (mode === 0) return;

    // ĐÃ SỬA: Đồng bộ 'manche' đồng nhất với state 'shade' để cập nhật mượt mà
    const stateKey = 
      device === 'bom' ? 'pump' :
      device === 'den' ? 'light' :
      device === 'phunsuong' ? 'spray' :
      device === 'manche' ? 'shade' : 'fan';

    setDeviceState(prev => ({ ...prev, [stateKey]: value }));

    try {
      await fetch(`${API_URL}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [device]: value ? 1 : 0 }),
      });
    } catch (err) {
      console.log("Control error:", err);
    }
  };

  // Hàm lưu tạm giá trị ngưỡng khi đang gõ phím
  const handleThresholdTyping = (thresholdKey: string, value: string) => {
    setThresholdInputs(prev => ({ ...prev, [thresholdKey]: value }));
  };

  // Hàm gửi API lên server khi người dùng gõ xong (Nhấn Done/bấm ra ngoài)
  const handleThresholdSave = async (thresholdKey: string, value: string) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return; 

    try {
      await fetch(`${API_URL}/thresholds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [thresholdKey]: numberValue }),
      });
    } catch (err) {
      console.log("Threshold error:", err);
    }
  };

  // Hàm chuyển đổi chế độ Auto/Manual
  const toggleMode = async (value: boolean) => {
    setMode(value ? 1 : 0);
    try {
      await fetch(`${API_URL}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: value ? 1 : 0 }),
      });
    } catch (err) {
      console.log("Mode error:", err);
    }
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    router.replace('/login');
  };

  // =============================
  // 4. GIAO DIỆN (UI)
  // =============================
  return (
    <ScrollView style={styles.mainWrapper} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/images/imageLogin.png')} style={styles.logo} />
        <Text style={styles.schoolName}>TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT{"\n"}THÀNH PHỐ HỒ CHÍ MINH</Text>
        <View style={styles.badgeTitle}>
          <Text style={styles.projectTitle}>ĐỒ ÁN TỐT NGHIỆP</Text>
        </View>
        <Text style={styles.projectDesc}>MÔ HÌNH HỆ THỐNG TƯỚI TIÊU THÔNG MINH SỬ DỤNG NĂNG LƯỢNG MẶT TRỜI</Text>
      </View>

      {/* SYSTEM MODE CONTROL */}
      <View style={styles.modeCard}>
        <View style={styles.modeInfo}>
          <MaterialCommunityIcons 
            name={mode === 0 ? "robot" : "hand-back-right"} 
            size={28} 
            color="#1b5e20" 
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.modeLabel}>Chế độ hệ thống</Text>
            <Text style={styles.modeStatus}>
              {mode === 0 ? 'Tự động (Auto)' : 'Thủ công (Manual)'}
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

      {/* SENSOR DATA SECTION */}
      <Text style={styles.sectionTitle}>Thông số môi trường</Text>
      <View style={styles.sensorGrid}>
        <View style={styles.sensorCard}>
          <View style={[styles.iconWrapper, { backgroundColor: '#ffebee' }]}>
            <MaterialCommunityIcons name="thermometer" size={28} color="#e53935" />
          </View>
          <Text style={styles.metricName}>Nhiệt độ</Text>
          <Text style={styles.metricValue}>{sensorData.temperature}<Text style={styles.unitText}>°C</Text></Text>
        </View>

        <View style={styles.sensorCard}>
          <View style={[styles.iconWrapper, { backgroundColor: '#e3f2fd' }]}>
            <MaterialCommunityIcons name="water-percent" size={30} color="#1e88e5" />
          </View>
          <Text style={styles.metricName}>Độ ẩm KK</Text>
          <Text style={styles.metricValue}>{sensorData.humidity}<Text style={styles.unitText}>%</Text></Text>
        </View>

        <View style={styles.sensorCard}>
          <View style={[styles.iconWrapper, { backgroundColor: '#efebe9' }]}>
            <MaterialCommunityIcons name="sprout" size={28} color="#6d4c41" />
          </View>
          <Text style={styles.metricName}>Độ ẩm đất</Text>
          <Text style={styles.metricValue}>{sensorData.soilMoisture}<Text style={styles.unitText}>%</Text></Text>
        </View>

        <View style={styles.sensorCard}>
          <View style={[styles.iconWrapper, { backgroundColor: '#fffde7' }]}>
            <MaterialCommunityIcons name="weather-sunny" size={28} color="#fbc02d" />
          </View>
          <Text style={styles.metricName}>Ánh sáng</Text>
          <Text style={styles.metricValue}>{sensorData.lightIntensity}<Text style={styles.unitText}> lx</Text></Text>
        </View>
      </View>

      {/* THRESHOLDS SETTINGS SECTION */}
      <Text style={styles.sectionTitle}>Cài đặt ngưỡng tự động</Text>
      <View style={styles.thresholdsBox}>
        <View style={styles.thresholdHeader}>
          <Text style={[styles.thHeaderLabel, { flex: 1.5 }]}>Thông số</Text>
          <Text style={[styles.thHeaderLabel, { flex: 1, textAlign: 'center' }]}>Ngưỡng dưới</Text>
          <Text style={[styles.thHeaderLabel, { flex: 1, textAlign: 'center' }]}>Ngưỡng trên</Text>
        </View>

        {/* NHIỆT ĐỘ */}
        <View style={styles.thresholdRow}>
          <View style={styles.thLabelContainer}>
            <MaterialCommunityIcons name="thermometer" size={18} color="#e53935" />
            <Text style={styles.thLabelText}>Nhiệt độ (°C)</Text>
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
            <MaterialCommunityIcons name="water-percent" size={18} color="#1e88e5" />
            <Text style={styles.thLabelText}>Độ ẩm KK (%)</Text>
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
            <MaterialCommunityIcons name="sprout" size={18} color="#6d4c41" />
            <Text style={styles.thLabelText}>Độ ẩm đất (%)</Text>
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
            <MaterialCommunityIcons name="weather-sunny" size={18} color="#fbc02d" />
            <Text style={styles.thLabelText}>Ánh sáng (lux)</Text>
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

      {/* DEVICE CONTROLS SECTION */}
      <Text style={styles.sectionTitle}>Điều khiển thiết bị thủ công</Text>
      {mode === 0 && (
        <Text style={styles.disabledWarning}>* Hãy chuyển sang chế độ Manual để điều khiển thiết bị</Text>
      )}

      <View style={styles.deviceGrid}>
        <View style={[styles.newDeviceCard, deviceState.pump && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
          <View style={[styles.deviceIconCircle, { backgroundColor: deviceState.pump ? '#fff' : '#e3f2fd' }]}>
            <MaterialCommunityIcons name="water" size={28} color={deviceState.pump ? '#2196F3' : '#90caf9'} />
          </View>
          <Text style={[styles.newDeviceLabel, deviceState.pump && styles.textActive]}>Bơm tưới</Text>
          <Switch
            value={deviceState.pump}
            onValueChange={value => handleDeviceToggle('bom', value)}
            disabled={mode === 0}
            trackColor={{ false: "#eeeeee", true: "#90caf9" }}
            thumbColor={deviceState.pump ? "#2196F3" : "#bdbdbd"}
          />
        </View>

        <View style={[styles.newDeviceCard, deviceState.spray && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
          <View style={[styles.deviceIconCircle, { backgroundColor: deviceState.spray ? '#fff' : '#e0f7fa' }]}>
            <MaterialCommunityIcons name="weather-fog" size={28} color={deviceState.spray ? '#00bcd4' : '#80deea'} />
          </View>
          <Text style={[styles.newDeviceLabel, deviceState.spray && styles.textActive]}>Phun sương</Text>
          <Switch
            value={deviceState.spray}
            onValueChange={value => handleDeviceToggle('phunsuong', value)}
            disabled={mode === 0}
            trackColor={{ false: "#eeeeee", true: "#80deea" }}
            thumbColor={deviceState.spray ? "#00bcd4" : "#bdbdbd"}
          />
        </View>

        <View style={[styles.newDeviceCard, deviceState.light && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
          <View style={[styles.deviceIconCircle, { backgroundColor: deviceState.light ? '#fff' : '#fffde7' }]}>
            <MaterialCommunityIcons name="lightbulb-on" size={28} color={deviceState.light ? '#fbc02d' : '#fff59d'} />
          </View>
          <Text style={[styles.newDeviceLabel, deviceState.light && styles.textActive]}>Đèn chiếu sáng</Text>
          <Switch
            value={deviceState.light}
            onValueChange={value => handleDeviceToggle('den', value)}
            disabled={mode === 0}
            trackColor={{ false: "#eeeeee", true: "#ffe082" }}
            thumbColor={deviceState.light ? "#fbc02d" : "#bdbdbd"}
          />
        </View>

        <View style={[styles.newDeviceCard, deviceState.fan && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
          <View style={[styles.deviceIconCircle, { backgroundColor: deviceState.fan ? '#fff' : '#fbe9e7' }]}>
            <MaterialCommunityIcons name="fan" size={28} color={deviceState.fan ? '#ff5722' : '#ffab91'} style={deviceState.fan ? { transform: [{ rotate: '45deg' }] } : {}} />
          </View>
          <Text style={[styles.newDeviceLabel, deviceState.fan && styles.textActive]}>Quạt tản nhiệt</Text>
          <Switch
            value={deviceState.fan}
            onValueChange={value => handleDeviceToggle('quat', value)}
            disabled={mode === 0}
            trackColor={{ false: "#eeeeee", true: "#ffab91" }}
            thumbColor={deviceState.fan ? "#ff5722" : "#bdbdbd"}
          />
        </View>
        
        {/* MÀN CHE - ĐÃ SỬA: Đồng bộ chuỗi truyền đi thành 'manche' */}
        <View style={[styles.newDeviceCard, deviceState.shade && styles.deviceCardActive, mode === 0 && styles.deviceCardDisabled]}>
          <View style={[styles.deviceIconCircle, { backgroundColor: deviceState.shade ? '#fff' : '#e8eaf6' }]}>
            <MaterialCommunityIcons name="blinds" size={28} color={deviceState.shade ? '#3f51b5' : '#9fa8da'} />
          </View>
          <Text style={[styles.newDeviceLabel, deviceState.shade && styles.textActive]}>Màn che</Text>
          <Switch
            value={deviceState.shade}
            onValueChange={value => handleDeviceToggle('manche', value)} 
            disabled={mode === 0}
            trackColor={{ false: "#eeeeee", true: "#9fa8da" }}
            thumbColor={deviceState.shade ? "#3f51b5" : "#bdbdbd"}
          />
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
  mainWrapper: { flex: 1, backgroundColor: '#f4f6f9' },
  container: { padding: 16, alignItems: 'center' },
  headerContainer: { alignItems: 'center', backgroundColor: '#fff', width: '100%', padding: 16, borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  logo: { width: 75, height: 75, marginBottom: 12, resizeMode: 'contain' },
  schoolName: { fontWeight: '800', fontSize: 13, textAlign: 'center', color: '#0d47a1', lineHeight: 18, letterSpacing: 0.3 },
  badgeTitle: { backgroundColor: '#e8f5e9', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 10, marginBottom: 6 },
  projectTitle: { fontWeight: '900', fontSize: 15, color: '#2e7d32', textAlign: 'center' },
  projectDesc: { fontWeight: '700', fontSize: 13, color: '#424242', textAlign: 'center', paddingHorizontal: 10, lineHeight: 18 },
  modeCard: { flexDirection: 'row', backgroundColor: '#e8f5e9', width: '100%', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#c8e6c9', marginBottom: 16 },
  modeInfo: { flexDirection: 'row', alignItems: 'center' },
  modeLabel: { fontSize: 12, color: '#4caf50', fontWeight: '600' },
  modeStatus: { fontSize: 15, fontWeight: '800', color: '#1b5e20', marginTop: 1 },
  sectionTitle: { alignSelf: 'flex-start', fontWeight: '800', fontSize: 16, color: '#263238', marginTop: 8, marginBottom: 12, paddingLeft: 4 },
  disabledWarning: { alignSelf: 'flex-start', fontSize: 12, color: '#e53935', fontWeight: '600', marginTop: -8, marginBottom: 12, paddingLeft: 4 },
  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  sensorCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  iconWrapper: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  metricName: { fontSize: 13, color: '#757575', fontWeight: '600', marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: '800', color: '#212121' },
  unitText: { fontSize: 14, fontWeight: '500', color: '#757575' },
  thresholdsBox: { backgroundColor: '#fff', width: '100%', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  thresholdHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eeeeee', paddingBottom: 8, marginBottom: 12 },
  thHeaderLabel: { fontSize: 11, fontWeight: '700', color: '#9e9e9e', textTransform: 'uppercase' },
  thresholdRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  thLabelContainer: { flex: 1.5, flexDirection: 'row', alignItems: 'center' },
  thLabelText: { fontSize: 13, fontWeight: '600', color: '#424242', marginLeft: 6 },
  thInput: { flex: 1, height: 36, backgroundColor: '#f5f5f5', borderRadius: 8, textAlign: 'center', fontWeight: '700', color: '#2e7d32', borderWidth: 1, borderColor: '#e0e0e0' },
  thSeparator: { marginHorizontal: 8, color: '#9e9e9e', fontWeight: '700' },
  deviceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  newDeviceCard: { width: '48%', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  deviceCardActive: { backgroundColor: '#e8f5e9', borderColor: '#a5d6a7' },
  deviceCardDisabled: { opacity: 0.65, backgroundColor: '#f5f5f5' },
  deviceIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  newDeviceLabel: { fontWeight: '700', fontSize: 13, color: '#455a64', marginBottom: 10, textAlign: 'center' },
  textActive: { color: '#1b5e20' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#e53935', width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 20, shadowColor: '#e53935', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});

export default HomeScreen;