import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Pdf from "react-native-pdf";

export default function FixedPdfViewer() {
  const router = useRouter();
  const { filePath, title } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [textContent, setTextContent] = useState(null);
  const [totalPages, setTotalPages] = useState(1000);
  const [page, setPage] = useState(1);
  const [bookMode, setBookMode] = useState(false);

  useEffect(() => {
    loadFile();
  }, [filePath]);

  const getFileExtension = (path) => path.split(".").pop().toLowerCase();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const loadFile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!filePath) {
        setError("No file path provided");
        return;
      }

      const extension = getFileExtension(filePath);
      setFileType(extension);

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        setError("File not found");
        return;
      }

      setFileSize(fileInfo.size || 0);

      if (extension === "txt") {
        const content = await FileSystem.readAsStringAsync(filePath);
        setTextContent(content);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load file: " + err.message);
      setLoading(false);
    }
  };

  const openWithExternalApp = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          dialogTitle: `Open "${title}" with...`,
        });
      } else {
        Alert.alert("Not Available", "File sharing is not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open file with external app");
    }
  };

  // Handle PDF load complete - ensure totalPages is set
  const handlePdfLoadComplete = (pages) => {
    console.log("PDF loaded with", pages, "pages");
    setTotalPages(pages);
  };

  // Book mode navigation logic
  const getLeftPage = () => {
    if (page === 1) return 1;
    return page % 2 === 0 ? page - 1 : page;
  };

  const getRightPage = () => {
    if (page === 1) return 2;
    return page % 2 === 0 ? page : page + 1;
  };

  const goToNextSpread = () => {
    const rightPage = getRightPage();
    if (rightPage < totalPages) {
      setPage(rightPage + 1);
    }
  };

  const goToPrevSpread = () => {
    const leftPage = getLeftPage();
    if (leftPage > 2) {
      setPage(leftPage - 2);
    } else if (page > 1) {
      setPage(1);
    }
  };

  const canGoNext = () => {
    if (totalPages === 0) return false;
    const rightPage = getRightPage();
    return rightPage < totalPages;
  };

  const canGoPrev = () => {
    return page > 1;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="mt-3 text-gray-600">Loading document...</Text>
          <Text className="mt-1 text-gray-500 text-sm">
            {fileType?.toUpperCase()} • {formatFileSize(fileSize)}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-6xl mb-4">⚠️</Text>
          <Text className="text-red-600 text-center text-lg mb-4 font-semibold">
            Cannot Display File
          </Text>
          <Text className="text-gray-600 text-center mb-4">{error}</Text>
          
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={loadFile}
              className="bg-green-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={openWithExternalApp}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Open Externally</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Text file viewer
    if (fileType === "txt" && textContent) {
      return (
        <ScrollView className="flex-1 bg-white">
          <View className="p-4">
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-gray-800 leading-6 text-base font-mono">
                {textContent}
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    // PDF viewer
    if (fileType === "pdf") {
      const source = { uri: filePath.startsWith("file://") ? filePath : `file://${filePath}` };
      
      console.log("=== PDF SOURCE DEBUG ===");
      console.log("Original filePath:", filePath);
      console.log("Constructed source:", source);
      console.log("========================");

      if (bookMode) {
        const leftPage = getLeftPage();
        const rightPage = getRightPage();
        
        console.log("=== BOOK MODE RENDER ===");
        console.log("Current totalPages:", totalPages);
        console.log("Current page state:", page);
        console.log("Left page:", leftPage);
        console.log("Right page:", rightPage);
        console.log("Right page <= totalPages:", rightPage <= totalPages);
        console.log("========================");
        
        return (
          <View className="flex-1 bg-black">
            
            <View className="flex-row flex-1 items-center">
              {/* Left Page */}
              <View className="flex-1 border-r border-gray-600">
                <Pdf
                  key={`left-${leftPage}`}
                  source={source}
                  page={leftPage}
                  scrollEnabled={false} 
                  style={{
                    width: Dimensions.get("window").width / 2,
                    height: "100%",
                  }}
                  onLoadComplete={handlePdfLoadComplete}
                  onError={(err) => {
                    console.log("PDF Error:", err);
                    setError("Failed to load PDF: " + err.message);
                  }}
                />
              </View>

              {/* Right Page */}
              <View className="flex-1">
                {totalPages > 0 && rightPage <= totalPages ? (
                  <Pdf
                    key={`right-${rightPage}`}
                    source={source}
                    page={rightPage}
                    scrollEnabled={false} 
                    style={{
                      width: Dimensions.get("window").width / 2,
                      height: "100%",
                    }}
                    onError={(err) => {
                      console.log("Right PDF Error:", err);
                    }}
                  />
                ) : totalPages > 0 ? (
                  <View className="flex-1 items-center justify-center bg-gray-800">
                    <Text className="text-gray-400">End of Document</Text>
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center bg-gray-700">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-gray-400 mt-2">Loading...</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Navigation Controls */}
            <View className="flex-row justify-between px-6 py-3 bg-white border-t border-gray-200">
              {/* Previous */}
              <TouchableOpacity
                onPress={goToPrevSpread}
                disabled={!canGoPrev()}
                className={`px-4 py-2 rounded-lg ${
                  canGoPrev() ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <Text className={`font-semibold ${
                  canGoPrev() ? "text-white" : "text-gray-500"
                }`}>
                  ⬅ Back
                </Text>
              </TouchableOpacity>

              {/* Page Info */}
              <Text className="text-gray-700 font-bold self-center">
                {totalPages > 0 ? (
                  leftPage === rightPage ? (
                    `Page ${leftPage} / ${totalPages}`
                  ) : (
                    rightPage <= totalPages ? 
                      `Pages ${leftPage}-${rightPage} / ${totalPages}` :
                      `Page ${leftPage} / ${totalPages}`
                  )
                ) : (
                  "Loading..."
                )}
              </Text>

              {/* Next */}
              <TouchableOpacity
                onPress={goToNextSpread}
                disabled={!canGoNext()}
                className={`px-4 py-2 rounded-lg ${
                  canGoNext() ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <Text className={`font-semibold ${
                  canGoNext() ? "text-white" : "text-gray-500"
                }`}>
                  Next ➡
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      // Normal scrolling mode
      return (
        <Pdf
          source={source}
          style={{ flex: 1, width: Dimensions.get("window").width }}
          onLoadComplete={handlePdfLoadComplete}
          onError={(err) => {
            console.log("PDF Error:", err);
            setError("Failed to load PDF: " + err.message);
          }}
        />
      );
    }

    // Other file types
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-600">This file type is not supported for preview</Text>
        <TouchableOpacity
          onPress={openWithExternalApp}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Open Externally</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-green-100">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between bg-white border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="px-3 py-2 bg-green-100 rounded-lg"
        >
          <Text className="text-green-700 font-semibold">← Back</Text>
        </TouchableOpacity>
        
        <View className="flex-1 items-center mx-4">
          <Text numberOfLines={1} className="text-lg font-bold text-gray-800">
            {title || "Document"}
          </Text>
          {fileType && (
            <Text className="text-xs text-gray-500 uppercase">
              {fileType} • {formatFileSize(fileSize)}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          onPress={() => setBookMode(!bookMode)} 
          className="px-3 py-2 bg-yellow-100 rounded-lg"
        >
          <Text className="text-yellow-700 font-semibold text-xs">
            {bookMode ? "Single Page" : "Book Mode"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">{renderContent()}</View>

      {/* Footer */}
      {!loading && !error && (
        <View className="bg-white px-4 py-2 border-t border-gray-200">
          <Text className="text-center text-gray-600 text-sm">
            {fileType === "txt" ? "Text Preview" : 
             fileType === "pdf" ? (bookMode ? "Book-style PDF Viewer" : "PDF Viewer") : 
             "File Manager"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}