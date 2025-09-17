import { SplashScreen, Stack } from "expo-router";
import './global.css';
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // ✅ import
import { initDB } from "../constants/db";  // ✅ import DB init


export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Magnifico-Daytime-ITC-Std-Regular": require("../assets/fonts/Magnifico-Daytime-ITC-Std-Regular.otf"),
  });

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();  // ✅ DB is ready before anything else
        if (fontsLoaded) {
          SplashScreen.hideAsync();
        }
      } catch (err) {
        console.log("DB init error:", err);
      }
    };
    if (!error) setup();
    if (error) throw error;
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (

      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ headerShown: false }} />
        <Stack.Screen name="pdfReader" options={{ headerShown: false }} />
        <Stack.Screen name="(add)" options={{ headerShown: false }} />
        <Stack.Screen name="(delete)" options={{ headerShown: false }} />
        <Stack.Screen name="(view)" options={{ headerShown: false }} />
      </Stack>

  );
}
