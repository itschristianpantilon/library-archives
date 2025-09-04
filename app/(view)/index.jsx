import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import SearchInput from "../../components/SearchInput";
import CloseButton from "../../components/CloseButton";
import { getFiles } from "../../constants/db";

const Categories = ["book", "thesis", "magazine", "reports"];


export default function ViewPage() {
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

  const openFile = async (path) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (!fileInfo.exists) {
        Alert.alert("Error", "File not found.");
        return;
      }
      await Linking.openURL(path);
    } catch (err) {
      console.log("Open error:", err);
      Alert.alert("Error", "Could not open file.");
    }
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

  const filteredItems = items.filter((item) => item.type === activeCategory);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openFile(item.path)}
      className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 mx-4"
    >
      <View className="flex-row items-start">
        <Text className="text-2xl mr-3">{getTypeIcon(item.type)}</Text>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-2">{item.title}</Text>
          <Text className="text-gray-600 mb-1">Author: {item.author}</Text>
          <Text className="text-gray-600 mb-1">Year: {item.yearPublished}</Text>
        </View>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-800 text-sm font-medium capitalize">{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-green-100">
      {/* Header */}
      <View className="w-full py-1 px-10 flex-row items-center justify-between">
        <CloseButton />
        <SearchInput placeholder="Search for a Book, Thesis, Magazine" />
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
                activeCategory === category ? "text-white" : "text-gray-700"
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items List */}
      <View className="flex-1 mt-4">
        {filteredItems.length === 0 ? (
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
