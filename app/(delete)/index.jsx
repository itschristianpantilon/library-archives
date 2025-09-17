import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CloseButton from "../../components/CloseButton";
import SearchInput from "../../components/SearchInput";
import * as FileSystem from "expo-file-system";
import { getFiles, deleteFile } from "../../constants/db";
import icons from "../../constants/icons";

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

          {item.uploadDate && (
              <Text className="text-gray-500 mb-1">Date Published: {item.uploadDate}</Text>  // ✅ Show upload date
          )}
        </View>
      </View>

      {/* Delete Button */}
      <View className="h-full">
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.path)}
          className="bg-red-500 px-5 py-2 rounded-full"
        >
          <Text className="text-white font-psemibold text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">

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
              className={`px-12 py-6 rounded-none font-semibold transition duration-300 ${
                activeCategory === category ? "bg-[#084526]" : "bg-white"
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
      </View>

      {/* Items List */}
      <View className="flex-1 mt-2">
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
