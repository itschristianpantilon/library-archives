import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";

import SearchInput from "../../components/SearchInput";
import CloseButton from "../../components/CloseButton";
import { getFiles } from "../../constants/db";
import icons from "../../constants/icons";





const Categories = ["book", "thesis", "magazine", "reports"];

export default function ViewPage() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(Categories[0]);
  const router = useRouter();

  const [counts, setCounts] = useState({ book: 0, thesis: 0, magazine: 0 });



  const loadItems = async () => {
    try {
      const result = await getFiles();
      setItems(result || []);

      // compute counts
      const bookCount = result.filter((f) => f.type === "book").length;
      const thesisCount = result.filter((f) => f.type === "thesis").length;
      const magazineCount = result.filter((f) => f.type === "magazine").length;

      setCounts({ book: bookCount, thesis: thesisCount, magazine: magazineCount });
    } catch (err) {
      console.log("DB load error:", err);
      setItems([]);
      setCounts({ book: 0, thesis: 0, magazine: 0 });
    }
  };


  useEffect(() => {
    loadItems();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case "book": return "📚";
      case "thesis": return "📄";
      case "magazine": return "📰";
      case "reports": return "📋";
      default: return "📂";
    }
  };

  const getFileExtension = (filename) => {
    return filename ? filename.split('.').pop().toLowerCase() : 'unknown';
  };

  const getSupportedFileIcon = (path) => {
    const ext = getFileExtension(path);
    switch (ext) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'txt': return '📄';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📊';
      default: return '📄';
    }
  };

  const handleOpenFile = async (item) => {
    try {
      if (!item.path) {
        Alert.alert("Error", "File path not found.");
        return;
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(item.path);
      if (!fileInfo.exists) {
        Alert.alert("Error", "File not found. It may have been moved or deleted.");
        return;
      }

      console.log("Opening file:", item.path);
      console.log("File title:", item.title);

      // Navigate to PDF reader with proper parameters
      router.push({
        pathname: "/pdfReader",
        params: {
          filePath: item.path,
          title: item.title || "Document"
        },
      });
    } catch (err) {
      console.log("File open error:", err);
      Alert.alert("Error", "Could not open file: " + err.message);
    }
  };


  const [searchQuery, setSearchQuery] = useState("");

  // 🔍 Apply both category filter and search filter
  const filteredItems = items.filter((item) => {
    const matchesCategory = item.type === activeCategory;
    const matchesSearch = searchQuery === "" ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.yearPublished?.toString().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });


  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleOpenFile(item)}
      className="bg-white p-4 mb-3 rounded-md shadow-sm border border-gray-200 mx-4"
    >
      <View className="flex-row items-start">
        <View className="mr-3">
          <Text className="text-2xl">{getTypeIcon(item.type)}</Text>
          {/* {item.path && (
              <Text className="text-lg">{getSupportedFileIcon(item.path)}</Text>
            )} */}
        </View>

        <View className="flex-1">
          <Text className="text-xl font-bold text-black mb-2">{item.title}</Text>
          <Text className="text-gray-600 font-plight mb-1">Author: {item.author}</Text>
          <Text className="text-gray-600 font-plight mb-1">Year: {item.yearPublished}</Text>

          {item.uploadDate && (
            <Text className="text-gray-500 mb-1">Date Published: {item.uploadDate}</Text>  // ✅ Show upload date
          )}

          {/* {item.path && (
              <View className="mt-2">
                <Text className="text-xs text-gray-500">
                  Format: {getFileExtension(item.path).toUpperCase()}
                </Text>
              </View>
            )} */}
        </View>


        <View className="items-end">
          <View className="bg-green-100 px-3 py-1 rounded-full mb-2">
            <Text className="text-green-800 text-sm font-medium capitalize">
              {item.type}
            </Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView className="flex-1">
      <Image
        source={icons.lightBackground}
        className="flex-1 w-full h-full absolute"
        resizeMode="cover"
      />
      {/* Header */}
      <View className="w-full py-5 flex-row items-center justify-between">
        <View className="px-5">
          <CloseButton />
        </View>
        <View className="w-full justify-center items-center absolute">
          <SearchInput
            placeholder="Search for a Book, Thesis, Magazine"
            onSearch={setSearchQuery}
          />

        </View>
        <View />
      </View>

      {/* Categories */}
      <View className="flex-row flex-wrap justify-center p-6">
        <View className="flex-row shadow-lg border border-gray-300">
          {Categories.map((category) => (
            <TouchableOpacity
              key={category}
              className={`px-12 py-6 rounded-none font-semibold transition duration-300 ${activeCategory === category ? "bg-[#084526]" : "bg-white"
                }`}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                className={`font-semibold text-lg capitalize ${activeCategory === category ? "text-white" : "text-gray-700"
                  }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Items List */}
      <View className="flex-1 mt-4">
        {activeCategory === "reports" ? (
          <ScrollView className="flex-1 px-6">
            {/* Summary Totals */}
            <View className="bg-white shadow-md rounded-lg p-6 mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-800 font-pregular text-lg"></Text>
                <Text className="text-gray-800 font-psemibold">Total</Text>
              </View>
              <View className="flex-row justify-between items-center py-1">
                <Text className="text-gray-800 font-pregular text-lg">Books</Text>
                <Text className="text-gray-800 font-psemibold mr-3">{counts.book}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1">
                <Text className="text-gray-800 font-pregular text-lg">Thesis</Text>
                <Text className="text-gray-800 font-psemibold mr-3">{counts.thesis}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1">
                <Text className="text-gray-800 font-pregular text-lg">Magazines</Text>
                <Text className="text-gray-800 font-psemibold mr-3">{counts.magazine}</Text>
              </View>
            </View>

            {/* ✅ Group & Sort by uploadDate */}
            {/* ✅ Group & Sort by uploadDate */}
            {Object.entries(
              items.reduce((groups, file) => {
                const date = file.uploadDate || "Unknown Date";
                if (!groups[date]) groups[date] = [];
                groups[date].push(file);
                return groups;
              }, {}) // ✅ removed TypeScript typing
            )
              // sort by date DESC (latest first)
              .sort(([a], [b]) => (a < b ? 1 : -1))
              .map(([date, files]) => (
                <View
                  key={date}
                  className="bg-white shadow-md rounded-lg p-5 mb-4 border border-gray-200"
                >
                  {/* Date Header */}
                  <Text className="text-lg font-bold text-[#084526]">
                    Uploaded on: {date}
                  </Text>

                  {/* Files in this date */}
                  {files
                    .sort((a, b) => (a.id < b.id ? 1 : -1)) // ✅ newest files first inside group
                    .map((file) => (
                      <View
                        key={file.id}
                        className="border-t border-gray-200 pt-3 mt-3"
                      >
                        <Text className="text-md font-semibold text-gray-800">
                          {file.title}
                        </Text>
                          <View className="flex-row w-full items-center gap-5">
                              <Text className="text-gray-600 font-pregular text-sm">Author: {file.author}</Text>
                              <Text className="text-gray-600 font-pregular text-sm">
                                Year Published: {file.yearPublished} 
                              </Text>
                              <Text className="text-gray-600 capitalize font-pregular text-sm">
                                Category: {file.type}
                              </Text>
                          </View> 
                      </View>
                    ))}
                </View>
              ))}
          </ScrollView>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-2xl mb-2">{getTypeIcon(activeCategory)}</Text>
            <Text className="text-gray-600 text-lg">
              No {activeCategory.toLowerCase()} found
            </Text>
            <Text className="text-gray-500 text-sm mt-2">
              This category is currently empty
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
      
    </SafeAreaView>
  );
}