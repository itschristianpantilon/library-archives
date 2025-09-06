import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function FixedPdfViewer() {
  const router = useRouter();
  const { filePath, title } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [textContent, setTextContent] = useState(null);
  const [webViewUri, setWebViewUri] = useState(null);

  useEffect(() => {
    loadFile();
  }, [filePath]);

  const getFileExtension = (path) => {
    return path.split('.').pop().toLowerCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      console.log(`Loading ${extension} file:`, filePath);
      console.log("File size:", formatFileSize(fileInfo.size));

      if (extension === 'txt') {
        // For text files, read content directly
        const content = await FileSystem.readAsStringAsync(filePath);
        setTextContent(content);
      } else if (extension === 'pdf') {
        // For PDF files, use file:// URI directly instead of base64
        // This avoids the TransactionTooLargeException
        setWebViewUri(filePath);
      }

      setLoading(false);
    } catch (err) {
      console.log("Load file error:", err);
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
      console.log("Share error:", error);
      Alert.alert("Error", "Could not open file with external app");
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📽️';
      case 'txt': return '📃';
      default: return '📄';
    }
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

    // Text files
    if (fileType === 'txt' && textContent) {
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

    // PDF files using direct file URI
    if (fileType === 'pdf' && webViewUri) {
      return (
        <View className="flex-1">
          <WebView
            source={{ 
              uri: webViewUri.startsWith('file://') ? webViewUri : `file://${webViewUri}`
            }}
            style={{ flex: 1 }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('PDF WebView error: ', nativeEvent);
              setError("This PDF cannot be displayed in the app. Please use 'Open Externally' to view with a PDF reader app.");
            }}
            onLoadStart={() => {
              console.log('PDF loading started');
              setLoading(true);
            }}
            onLoadEnd={() => {
              console.log('PDF loading completed');
              setLoading(false);
            }}
            javaScriptEnabled={true}
            allowFileAccess={true}
            onHttpError={(syntheticEvent) => {
              console.log('PDF HTTP Error:', syntheticEvent.nativeEvent);
            }}
            renderError={(errorName) => (
              <View className="flex-1 items-center justify-center px-4">
                <Text className="text-6xl mb-4">📄</Text>
                <Text className="text-xl font-bold text-gray-800 mb-2">PDF Not Supported</Text>
                <Text className="text-gray-600 text-center mb-4">
                  This device cannot display PDFs in the app.
                </Text>
                <TouchableOpacity
                  onPress={openWithExternalApp}
                  className="bg-red-600 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold">Open with PDF Reader</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      );
    }

    // All other file types - show info and external open option
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-8xl mb-6">{getFileIcon(fileType)}</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {title}
        </Text>
        <Text className="text-lg text-gray-600 mb-6 text-center">
          {fileType?.toUpperCase()} Document
        </Text>
        
        <View className="bg-white p-6 rounded-xl mb-6 w-full shadow-sm">
          <Text className="text-center text-gray-700 mb-4">
            This file type requires an external application to view properly.
          </Text>
          
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-sm text-gray-600 mb-1">
              <Text className="font-semibold">File:</Text> {title}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              <Text className="font-semibold">Type:</Text> {fileType?.toUpperCase()}
            </Text>
            <Text className="text-sm text-gray-600">
              <Text className="font-semibold">Size:</Text> {formatFileSize(fileSize)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={openWithExternalApp}
          className="bg-blue-600 px-8 py-4 rounded-xl mb-4 w-full"
        >
          <Text className="text-white font-bold text-lg text-center">
            Open with External App
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-500 text-sm text-center">
          Recommended apps: Adobe Reader, Microsoft Word, Google Docs, etc.
        </Text>
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
          onPress={openWithExternalApp}
          className="px-3 py-2 bg-blue-100 rounded-lg"
        >
          <Text className="text-blue-700 font-semibold text-xs">External</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        {renderContent()}
      </View>

      {/* Footer */}
      {!loading && !error && (
        <View className="bg-white px-4 py-2 border-t border-gray-200">
          <Text className="text-center text-gray-600 text-sm">
            {fileType === 'txt' ? 'Text Preview' : 
             fileType === 'pdf' ? 'PDF Viewer (Beta)' : 
             'File Manager'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}