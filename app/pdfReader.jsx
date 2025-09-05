// app/pdfReader.jsx
import React from "react";
import { View, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Pdf from "react-native-pdf";

export default function pdfReader() {   // ✅ default export is here
  const { filePath } = useLocalSearchParams();

  const source = { uri: filePath, cache: true };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Pdf
        source={source}
        style={{ flex: 1, width: Dimensions.get("window").width }}
        horizontal={false}
        enablePaging={true}
        renderActivityIndicator={() => (
          <ActivityIndicator size="large" color="#00ff00" />
        )}
        onError={(error) => {
          console.log("PDF Error:", error);
        }}
      />
    </SafeAreaView>
  );
}
