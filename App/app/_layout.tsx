// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }

import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    // headerShown: false để ẩn thanh tiêu đề trắng ở trên cùng màn hình
    <Stack screenOptions={{ headerShown: false }}>
      {/* Expo Router sẽ tự động lấy file tên 'index' làm màn hình chạy đầu tiên khi mở app */}
      <Stack.Screen name="index" /> 
      <Stack.Screen name="login" />
      <Stack.Screen name="homescreen" />
      
      {/* Giữ lại cấu hình cho file modal nếu bạn có dùng */}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}