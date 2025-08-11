import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from '../../components/CustomButton';
import CloseButton from "../../components/CloseButton";
import SearchInput from "../../components/SearchInput";
import { useState } from "react";


const Categories = ["Books", "Thesis", "Magazine", "Reports"]; // example categories

export default function Index() {

   const [activeCategory, setActiveCategory] = useState(Categories[0]);

  return (
    <SafeAreaView className="flex-1 bg-green-100">

       <View className="w-full py-1 px-10 flex-row items-center justify-between">
        <CloseButton />
        <SearchInput  
          placeholder="Select a file to Delete"
        />
        <View />
      </View>


      <View className="flex-1 w-full flex-row justify-center  p-6">
              <View className="">
                {/* Categories */}git init
                <View className="flex-row flex-wrap justify-center">
                  {Categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      className={`px-12 py-6 rounded-none font-semibold transition duration-300 ${
                        activeCategory === category
                          ? "bg-green-600"
                          : "bg-white"
                      }`}
                      onPress={() => setActiveCategory(category)}>
                      <Text
                        className={`font-semibold text-lg ${
                          activeCategory === category
                            ? "text-white"
                            : "text-gray-700"
                        }`}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
      
              </View>
            </View>
    </SafeAreaView>
    
  );
}
