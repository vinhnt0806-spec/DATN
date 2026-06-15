import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Lock, User } from 'iconsax-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = "https://datn-iot-hcmute.onrender.com";
const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Thành công", "Đăng nhập thành công!");
        setTimeout(() => {
          router.replace("/Home");
        }, 1000);
      } else {
        Alert.alert("Đăng nhập thất bại", data.message || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối tới Server Node.js");
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      
      {/* --- LỚP NỀN MÀU XANH UỐN LƯỢN (VẼ BẰNG CODE) --- */}
      <View style={styles.waveBackground} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* --- PHẦN TIÊU ĐỀ & LOGO --- */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>HỆ THỐNG TƯỚI TIÊU</Text>
            <Text style={styles.mainTitle}>TỰ ĐỘNG</Text>
            
            <Image
              source={require('../assets/images/imageLogin.png')}
              style={styles.logo}
            />
            
            <Text style={styles.subTitle}>SỬ DỤNG NĂNG LƯỢNG MẶT TRỜI</Text>
          </View>

          {/* --- FORM ĐĂNG NHẬP --- */}
          <View style={styles.cardContainer}>
            
            <View style={styles.inputWrapper}>
              <User size={20} color="#070619" variant="Outline" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size="20" color="#070619" variant="Outline" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#94A3B8"
                value={password}
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color="#94A3B8" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.rowActions}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Ionicons 
                  name={rememberMe ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={rememberMe ? "#057A39" : "#94A3B8"} 
                />
                <Text style={styles.checkboxText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
            </TouchableOpacity>

           {/* <View style={styles.separatorRow}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>Hoặc đăng nhập bằng</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <Image 
                source={{uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'}} 
                style={{width: 18, height: 18, marginRight: 10}}
              />
              <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerRegister}>
              <Text style={styles.footerText}>
                Chưa có tài khoản? <Text style={styles.registerHighlight}>Đăng ký</Text>
              </Text>
            </TouchableOpacity>
*/}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Phông nền gốc màu trắng
  },
  
  /* --- CSS TẠO NỀN XANH LƯỢN SÓNG --- */
  waveBackground: {
    position: 'absolute',
    bottom: 0,
    left: -(width * 0.5), // Mở rộng ra 2 bên để không bị hở viền
    width: width * 2,     // Chiều rộng gấp đôi màn hình
    height: '62%',        // Chiếm 60% chiều cao phía dưới
    backgroundColor: '#b5dec0', // Màu xanh lợt y chang ảnh thiết kế
    borderTopLeftRadius: 1000, 
    borderTopRightRadius: 1000,
    transform: [{ scaleX: 1.5 }], // Kéo dẹt hình tròn để tạo thành đường cong nhẹ nhàng
  },

  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A3B8B', 
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#057A39', 
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginHorizontal: 20,
    // Hiệu ứng nổi bọt (Shadow)
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  eyeIcon: {
    padding: 4,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 6,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3B8B',
  },
  loginButton: {
    backgroundColor: '#057A39',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  separatorText: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  googleButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  footerRegister: {
    alignItems: 'center',
    marginTop: 5,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  registerHighlight: {
    color: '#057A39',
    fontWeight: 'bold',
  },
});