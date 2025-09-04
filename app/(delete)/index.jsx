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

const Categories = ["Books", "Thesis", "Magazine", "Reports"];

export default function DeletePage() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(Categories[0]);

  const loadItems = async () => {
    try {
      const result = await getFiles();
      setItems(result || []);
    } catch (err) {
      console.log("DB load error:", err);
      setItems([]);
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
      case "Books": return "📚";
      case "Thesis": return "📄";
      case "Magazine": return "📰";
      case "Reports": return "📋";
      default: return "📂";
    }
  };

  const filteredItems = items.filter(
    (item) => item.type === activeCategory
  );

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
    <SafeAreaView className="flex-1 bg-green-100">
      {/* Header */}
      <View className="w-full py-1 px-10 flex-row items-center justify-between">
        <CloseButton />
        <SearchInput placeholder="Select a file to Delete" />
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
              className={`font-semibold text-lg ${
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
        {filteredItems.length === 0 ? (
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
