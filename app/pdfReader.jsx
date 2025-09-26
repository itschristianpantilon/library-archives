import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Pdf from "react-native-pdf";
import icons from "../constants/icons";




export default function FixedPdfViewer() {
  const router = useRouter();
  const { filePath, title } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [textContent, setTextContent] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfReady, setPdfReady] = useState(false);
  

  useEffect(() => {
    loadFile();
  }, [filePath]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debug totalPages changes
  useEffect(() => {
    console.log("totalPages changed to:", totalPages);
  }, [totalPages]);

  // Timeout fallback for PDF loading
  useEffect(() => {
    if (fileType === "pdf" && totalPages === 0) {
      const timeout = setTimeout(() => {
        if (totalPages === 0) {
          console.log("PDF loading timeout - using high fallback totalPages");
          setTotalPages(100); // High fallback to ensure we don't miss pages
          setPdfReady(true);
          setLoading(false);
        }
      }, 5000); // Longer timeout

      return () => clearTimeout(timeout);
    }
  }, [fileType, totalPages]);


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
    } catch (_error) {
      Alert.alert("Error", "Could not open file with external app");
    }
  };

  // Handle PDF load complete
  const handlePdfLoadComplete = (numberOfPages, filePath, width, height, tableContents) => {
    console.log("PDF onLoadComplete called with arguments:");
    console.log("Argument 0 (numberOfPages):", numberOfPages, "Type:", typeof numberOfPages);
    console.log("Argument 1 (filePath):", filePath);
    console.log("Argument 2 (width):", width);
    console.log("Argument 3 (height):", height);
    console.log("Argument 4 (tableContents):", tableContents);

    let pages = numberOfPages;

    // Handle different possible formats based on react-native-pdf documentation
    if (typeof numberOfPages === 'object') {
      if (numberOfPages?.numberOfPages) {
        pages = numberOfPages.numberOfPages;
      } else if (numberOfPages?.pageCount) {
        pages = numberOfPages.pageCount;
      } else if (numberOfPages?.total) {
        pages = numberOfPages.total;
      }
    }

    console.log("Final extracted pages:", pages);

    if (typeof pages === 'number' && pages > 0) {
      setTotalPages(pages);
      setPdfReady(true);
      setLoading(false);
      console.log("✅ PDF ready state set to true, totalPages:", pages);

      // Reset to page 1 if current page exceeds total pages
      if (currentPage > pages) {
        setCurrentPage(1);
      }
    } else {
      console.warn("❌ Could not determine page count from onLoadComplete");
      // Don't set fallback here - let the timeout handle it
    }
  };

  // Handle page changes to also capture total pages
  const handlePageChanged = (page, numberOfPages) => {
    console.log("PDF onPageChanged called:", { page, numberOfPages });

    if (typeof numberOfPages === 'number' && numberOfPages > 0 && totalPages === 0) {
      console.log("✅ Got total pages from onPageChanged:", numberOfPages);
      setTotalPages(numberOfPages);
      setPdfReady(true);
      setLoading(false);
    }

    if (typeof page === 'number' && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  

  // Book mode navigation (advance by 2 pages for spreads)
  const goToNextPage = () => {
    const nextPage = currentPage + 2;
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
    } else if (currentPage + 1 <= totalPages) {
      // If we can't advance by 2, try advancing by 1 (for the last page)
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    const prevPage = currentPage - 2;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
    } else if (currentPage > 1) {
      // If we can't go back by 2, go to page 1
      setCurrentPage(1);
    }
  };

  const canGoNext = () => {
    return totalPages > 0 && currentPage < totalPages;
  };

  const canGoPrev = () => {
    return totalPages > 0 && currentPage > 1;
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

      const leftPage = currentPage % 2 === 1 ? currentPage : currentPage - 1;
      const rightPage = leftPage + 1;

      return (
        <View className="w-[85%] h-[90%] items-center justify-center">
          <View className="flex-row items-center justify-center">
            {/* Previous */}
            <TouchableOpacity
              onPress={goToPrevPage}
              disabled={!canGoPrev()}
              className={`flex-row items-center justify-center p-3 rounded-full mr-5 ${
                canGoPrev() ? "bg-[#084526]" : "bg-gray-300"
              }`}
            >
              <Image
                source={icons.previous}
                resizeMode="contain"
                className="w-5 h-5 mr-1"
              />
            </TouchableOpacity>

            {/* Left Page */}
            <View className="border-[10px] border-[#084526]">
              <Pdf
                key={`left-${leftPage}`}
                source={source}
                page={leftPage}
                scrollEnabled={false}
                style={{
                  width: Dimensions.get("window").width / 3,
                  height: "100%",
                }}
                onLoadComplete={handlePdfLoadComplete}
                onPageChanged={handlePageChanged}
                onError={(err) => {
                  console.error("Left PDF Error:", err);
                  setError(`Failed to load PDF: ${err?.message || 'Unknown error'}`);
                }}
              />
            </View>

            {/* Right Page */}
            <View className="border-r-[10px] border-t-[10px] border-b-[10px] border-[#084526]">
              {totalPages === 0 || rightPage <= totalPages ? (
                <Pdf
                  key={`right-${rightPage}`}
                  source={source}
                  page={rightPage}
                  scrollEnabled={false}
                  style={{
                    width: Dimensions.get("window").width / 3,
                    height: "100%",
                  }}
                  onError={(err) => {
                    console.error("Right PDF Error:", err);
                  }}
                />
              ) : (
                <View className="flex-1 items-center justify-center bg-gray-800" style={{ width: Dimensions.get("window").width / 3 }}>
                  <Text className="text-gray-400">End of Document</Text>
                </View>
              )}
            </View>

            {/* Next */}
            <TouchableOpacity
              onPress={goToNextPage}
              disabled={!canGoNext()}
              className={`flex-row items-center justify-center p-3 rounded-full ml-5 ${
                canGoNext() ? "bg-[#084526]" : "bg-gray-300"
              }`}
            >
              <Image
                source={icons.next}
                resizeMode="contain"
                className="w-5 h-5 ml-1"
              />
            </TouchableOpacity>
          </View>

          {/* Navigation Controls */}
          <View className="flex-row justify-between px-6 py-3 mt-2 rounded-full bg-white">
            <Text className="text-gray-700 font-bold self-center">
              {totalPages === 0 ? (
                "Loading..."
              ) : rightPage <= totalPages ? (
                `Pages ${leftPage}-${rightPage} / ${totalPages}`
              ) : (
                `Page ${leftPage} / ${totalPages}`
              )}
            </Text>
          </View>
        </View>
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
    
    <SafeAreaView className="flex-1 bg-white justify-center items-center ">
            <Image
              source={icons.lightBackground}
              className="flex-1 w-full h-full absolute"
              resizeMode="cover"
            />
      {/* Header */}
      <View className="w-full py-2 flex-row justify-between items-center">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="px-3 py-2 ml-5 bg-[#084526] rounded-full items-center justify-center flex-row"
        >
          <Image 
            source={icons.close}
            resizeMode="contain"
            className="w-5 h-5 mr-2"
          />
          <Text className="text-white font-semibold text-xs">Close</Text>
        </TouchableOpacity>
        
        <View className="absolute w-full justify-center items-center">
          <Text numberOfLines={1} className="text-md font-bold text-gray-800">
            {title || "Document"}
          </Text>
          {fileType && (
            <Text className="font-semibold text-gray-500 uppercase text-xs">
              {fileType} • {formatFileSize(fileSize)}
            </Text>
          )}
        </View>

        <View />

        {/* <TouchableOpacity 
          onPress={() => setBookMode(!bookMode)} 
          className="px-4 rounded-full py-3 bg-orange-900 "
        >
          <Text className="text-white font-semibold text-sm">
            {bookMode ? "Single Page" : "Book Mode"}
          </Text>
        </TouchableOpacity> */}
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center">{renderContent()}</View>
       
    </SafeAreaView>
  );
}