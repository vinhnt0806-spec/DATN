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

const API_URL = "http://10.48.59.111:3000";

const HomeScreen = () => {

  // =============================
  // STATE
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
  });

  const [thresholds, setThresholds] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });

  const [thresholdInputs, setThresholdInputs] = useState({
    temperature: '0',
    humidity: '0',
    soilMoisture: '0',
    lightIntensity: '0',
  });

  const [mode, setMode] = useState(0);

  // =============================
  // LẤY DỮ LIỆU TỪ SERVER
  // =============================

  useEffect(() => {

    const fetchData = async () => {

      try {

        const response = await fetch(`${API_URL}/data`);

        const data = await response.json();

        // SENSOR
        setSensorData({
          temperature: data.sensorData?.nhietdo ?? 0,
          humidity: data.sensorData?.doamkk ?? 0,
          soilMoisture: data.sensorData?.doamdat ?? 0,
          lightIntensity: data.sensorData?.anhsang ?? 0,
        });

        // DEVICE
        setDeviceState({
          pump: data.control?.bom === 1,
          light: data.control?.den === 1,
          spray: data.control?.phunsuong === 1,
          fan: data.control?.quat === 1,
        });

        // THRESHOLDS
        setThresholds({
          temperature: data.thresholds?.temperature ?? 0,
          humidity: data.thresholds?.humidity ?? 0,
          soilMoisture: data.thresholds?.soilMoisture ?? 0,
          lightIntensity: data.thresholds?.lightIntensity ?? 0,
        });

        // INPUTS
        setThresholdInputs({
          temperature: String(data.thresholds?.temperature ?? 0),
          humidity: String(data.thresholds?.humidity ?? 0),
          soilMoisture: String(data.thresholds?.soilMoisture ?? 0),
          lightIntensity: String(data.thresholds?.lightIntensity ?? 0),
        });

        // MODE
        setMode(data.system?.mode ?? 0);

      } catch (err) {

        console.log("Fetch error:", err);

      }

    };

    // chạy lần đầu
    fetchData();

    // tự động cập nhật mỗi 1 giây
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);

  }, []);

  // =============================
  // ĐIỀU KHIỂN THIẾT BỊ
  // =============================

  const handleDeviceToggle = async (
  device: string,
  value: boolean
) => {

  if (mode === 0) return;

  // cập nhật UI ngay
  setDeviceState(prev => ({
    ...prev,
    [device === 'bom' ? 'pump' :
      device === 'den' ? 'light' :
      device === 'phunsuong' ? 'spray' :
      'fan']: value
  }));

  try {

    await fetch(`${API_URL}/control`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        [device]: value ? 1 : 0,
      }),
    });

  } catch (err) {

    console.log("Control error:", err);

  }

};

  // =============================
  // CẬP NHẬT THRESHOLD
  // =============================

  const handleThresholdChange = async (
    threshold: string,
    value: string
  ) => {

    setThresholdInputs(prev => ({
      ...prev,
      [threshold]: value,
    }));

    const numberValue = parseFloat(value) || 0;

    try {

      await fetch(`${API_URL}/thresholds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [threshold]: numberValue,
        }),
      });

    } catch (err) {

      console.log("Threshold error:", err);

    }

  };

  // =============================
  // CHUYỂN MODE
  // =============================

const toggleMode = async (value: boolean) => {

  // cập nhật UI ngay
  setMode(value ? 1 : 0);

  try {

    await fetch(`${API_URL}/control`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: value ? 1 : 0,
      }),
    });

  } catch (err) {

    console.log("Mode error:", err);

  }

};

  // =============================
  // LOGOUT
  // =============================

  const handleLogout = () => {

    router.replace('/login');

  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hiển thị thông tin */}
      <View style={styles.headerContainer}>
        <Image source={require('../../../assets/images/imageLogin.png')} style={styles.logo} />
        <Text style={styles.schoolName}>TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT THÀNH PHỐ HỒ CHÍ MINH</Text>
        <Text style={styles.projectTitle}>ĐỒ ÁN TỐT NGHIỆP</Text>
        <Text style={styles.projectDesc}>MÔ HÌNH HỆ THỐNG TƯỚI TIÊU THÔNG MINH SỬ DỤNG NĂNG LƯỢNG MẶT TRỜI</Text>
      </View>

      {/* Cảm biến và Giá trị cài đặt */}
      <View style={styles.cardRow}>
        <View style={styles.cardBlock}>
          <Text style={styles.blockTitle}>Display sensor values</Text>
          <View style={styles.cardGrid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🌡️ Temperature</Text>
              <Text style={styles.cardValue}>{sensorData.temperature} °C</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>💧 Air Humidity</Text>
              <Text style={styles.cardValue}>{sensorData.humidity} %</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🌱 Soil Moisture</Text>
              <Text style={styles.cardValue}>{sensorData.soilMoisture} %</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>☀️ Light Intensity</Text>
              <Text style={styles.cardValue}>{sensorData.lightIntensity} lux</Text>
            </View>
          </View>
        </View>
        { /* Cài đặt giá trị */}
        <View style={styles.cardBlock}>
          <Text style={styles.blockTitle}>Setting Values</Text>
          <View style={styles.cardGrid}>
            <View style={styles.cardInput}>
              { /* Nhiệt độ */}
              <Text style={styles.cardLabel}>🌡️ Temperature</Text>  
              <TextInput
                style={styles.input}
                value={thresholdInputs.temperature}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('temperature', text)}
                placeholder="Enter temperature"
              />
            </View>
            <View style={styles.cardInput}>
              {/* Độ ẩm không khí */}
              <Text style={styles.cardLabel}>💧 Air Humidity</Text>  
              <TextInput
                style={styles.input}
                value={thresholdInputs.humidity}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('humidity', text)}
                placeholder="Enter humidity"
              />
            </View>
            <View style={styles.cardInput}>
              {/* Độ ẩm đất */}
              <Text style={styles.cardLabel}>🌱 Soil Moisture</Text> 
              <TextInput
                style={styles.input}
                value={thresholdInputs.soilMoisture}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('soilMoisture', text)}
                placeholder="Enter soil moisture"
              />
            </View>
            <View style={styles.cardInput}>
              {/* Cường độ ánh sáng */}
              <Text style={styles.cardLabel}>☀️ Light Intensity</Text> 
              <TextInput
                style={styles.input}
                value={thresholdInputs.lightIntensity}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('lightIntensity', text)}
                placeholder="Enter light intensity"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Điều khiển thiết bị */}
      <Text style={styles.controlTitle}>Device Controls</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
        <View style={styles.deviceControlRow}>
          <View style={styles.deviceCard}>
            {/* Bơm tưới*/}
            <MaterialCommunityIcons name="water" size={36} color="#2196F3" /> 
            <Text style={styles.deviceLabel}>Irrigation Pump</Text>
            <Switch
              value={deviceState.pump}
              onValueChange={value => handleDeviceToggle('bom', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#81d4fa" }}
              thumbColor={deviceState.pump ? "#2196F3" : "#f4f3f4"}
            />
          </View>
          <View style={styles.deviceCard}>
            {/* Bơm phun sương */}
            <MaterialCommunityIcons name="water" size={36} color="#2196F3" /> 
            <Text style={styles.deviceLabel}>Misting Pump</Text>
            <Switch
              value={deviceState.spray}
              onValueChange={value => handleDeviceToggle('phunsuong', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#81d4fa" }}  
              thumbColor={deviceState.spray ? "#2196F3" : "#f4f3f4"}
            />
          </View>
          <View style={styles.deviceCard}>
            {/* Đèn chiếu sáng */}
            <MaterialCommunityIcons name="lightbulb-on-outline" size={36} color="#FFEB3B" /> 
            <Text style={styles.deviceLabel}>Light</Text>
            <Switch
              value={deviceState.light}
              onValueChange={value => handleDeviceToggle('den', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#81d4fa" }}  
              thumbColor={ deviceState.light ? "#2196F3"   : "#f4f3f4" }
            />
          </View>
          <View style={styles.deviceCard}>
            {/* Quạt */}
            <MaterialCommunityIcons name="fan" size={36} color="#F44336" /> 
            <Text style={styles.deviceLabel}>Fan</Text>
            <Switch
              value={deviceState.fan}
              onValueChange={value => handleDeviceToggle('quat', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#81d4fa" }} 
              thumbColor={ deviceState.fan ? "#2196F3" : "#f4f3f4" }
            />
          </View>
          <View style={styles.deviceCard}>
            {/* Chế độ tự động/manual */}
            <MaterialCommunityIcons name="refresh" size={36} color="#2196F3" />
            <Text style={styles.deviceLabel}>{mode === 0 ? 'Auto' : 'Manual'}</Text>
            <Switch
              value={mode === 1}
              onValueChange={toggleMode}
            />
          </View>
        </View>
      </ScrollView>

      {/* Logout button */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  schoolName: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    color: '#003366',
  },
  projectTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1a7f37',
    marginTop: 2,
    textAlign: 'center',
  },
  projectDesc: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1a7f37',
    marginBottom: 2,
    textAlign: 'center',
  },
  teacher: {
    fontSize: 13,
    color: '#333',
    marginBottom: 1,
  },
  student: {
    fontSize: 13,
    color: '#333',
    marginBottom: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  cardBlock: {
    flex: 1,
    backgroundColor: '#e6f7e6',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  blockTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a7f37',
  },
  cardGrid: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  cardInput: {
    width: '100%',
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  cardLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  cardValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1a7f37',
    textAlign: 'center',
    marginTop: 2,
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    marginTop: 2,
  },
  controlTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: '#1a7f37',
  },
  deviceControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
    marginBottom: 10,
  },
  deviceCard: {
    flex: 1,
    minWidth: 90,
    maxWidth: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: 6,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default HomeScreen;