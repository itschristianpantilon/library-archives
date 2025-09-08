import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CloseButton from "../../components/CloseButton";
import SearchInput from "../../components/SearchInput";
import * as FileSystem from "expo-file-system";
import { getFiles, deleteFile } from "../../constants/db";

const Categories = ["book", "thesis", "magazine", "reports"];

export default function DeletePage() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(Categories[0]);
  const [counts, setCounts] = useState({ book: 0, thesis: 0, magazine: 0 });

  const loadItems = async () => {
    try {
      const result = await getFiles();
      setItems(result || []);

      // compute counts for reports
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

  const handleDelete = (id, path) => {
    Alert.alert("Delete File", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const fileInfo = await FileSystem.getInfoAsync(path);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(path, { idempotent: true });
            }
            await deleteFile(id);
            loadItems();
          } catch (err) {
            console.log("Delete error:", err);
            Alert.alert("Error", "Could not delete file.");
          }
        },
      },
    ]);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "book": return "📚";
      case "thesis": return "📄";
      case "magazine": return "📰";
      case "reports": return "📋";
      default: return "📂";
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
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 mx-4 flex-row justify-between items-center">
      <View className="flex-row flex-1 items-start">
        <Text className="text-2xl mr-3">{getTypeIcon(item.type)}</Text>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            {item.title}
          </Text>
          <Text className="text-gray-600 mb-1">Author: {item.author}</Text>
          <Text className="text-gray-600 mb-1">Year: {item.yearPublished}</Text>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.path)}
        className="bg-red-500 px-3 py-1 rounded"
      >
        <Text className="text-white text-sm">Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-green-200">
      {/* Header */}
      <View className="w-full py-2 flex-row items-center justify-between">
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
        {Categories.map((category) => (
          <TouchableOpacity
            key={category}
            className={`px-12 py-6 rounded-none font-semibold transition duration-300 ${
              activeCategory === category ? "bg-green-600" : "bg-white"
            }`}
            onPress={() => setActiveCategory(category)}
          >
            <Text
              className={`font-semibold text-lg capitalize ${
                activeCategory === category
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items List */}
      <View className="flex-1 mt-2">
        {activeCategory === "reports" ? (
          <View className="flex-1 justify-start items-center px-6">
            <View className="bg-white shadow-md rounded-lg p-6 w-full">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-800 font-pregular text-2xl">LIST OF BOOKS </Text>
                <Text className="text-gray-800 font-psemibold">TOTAL: {counts.book}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-800 font-pregular text-2xl">LIST OF THESIS </Text>
                <Text className="text-gray-800 font-psemibold">TOTAL: {counts.thesis}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-800 font-pregular text-2xl">LIST OF MAGAZINES </Text>
                <Text className="text-gray-800 font-psemibold">TOTAL: {counts.magazine}</Text>
              </View>

              <View className="mt-4 border-t border-gray-300 pt-3">
                <Text className="text-gray-600 text-sm">
                  This report automatically updates when you add or delete files.
                </Text>
              </View>
            </View>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-2xl mb-2">{getTypeIcon(activeCategory)}</Text>
            <Text className="text-gray-600 text-lg">
              No {activeCategory.toLowerCase()} found
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
