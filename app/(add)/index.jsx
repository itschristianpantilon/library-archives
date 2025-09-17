import React, { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import CloseButton from "../../components/CloseButton";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { addFile } from "../../constants/db";
import icons from "../../constants/icons";

export default function AddPage() {
  const [showAddPage, setShowAddPage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    yearPublished: "",
    type: "book",
  });
  const [filePath, setFilePath] = useState(null);

  // Pick file
  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (res.canceled) return;

      const file = res.assets[0];
      const destPath = FileSystem.documentDirectory + file.name;

      await FileSystem.copyAsync({
        from: file.uri,
        to: destPath,
      });

      setFilePath(destPath);
      Alert.alert("File Selected", `Filename: ${file.name}`);
    } catch (err) {
      console.log("Pick file error:", err);
      Alert.alert("Error", "Could not pick file");
    }
  };

  // Save to SQLite
// Save to SQLite
const saveToDB = async () => {
  const { title, author, yearPublished, type } = formData;

  if (!title || !author || !yearPublished || !filePath) {
    Alert.alert("Missing Info", "Please fill all fields and select a file.");
    return;
  }

  try {
    const uploadDate = new Date().toLocaleDateString(); // ✅ Auto-set date (MM/DD/YYYY or locale format)

    await addFile({
      title,
      author,
      yearPublished,
      type,
      path: filePath,
      uploadDate,   // ✅ Save date
    });

    Alert.alert("Saved!", "File added to library.");
    setFormData({ title: "", author: "", yearPublished: "", type: "book" });
    setFilePath(null);
    setShowAddPage(false);
  } catch (err) {
    console.log("DB insert error:", err);
    Alert.alert("Error", "Could not save file.");
  }
};


  // ---------------- UI ----------------
  if (showAddPage) {
    return (
      <ScrollView className="flex-1 bg-white">
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8 w-full">
            <TouchableOpacity
                onPress={() => {
                  // ✅ Reset the form before closing
                  setFormData({
                    type: "",
                    title: "",
                    author: "",
                    yearPublished: "",
                  });
                  setFilePath(null);
                  setShowAddPage(false);
                }}
                className="bg-[#084526] px-4 py-2 flex-row justify-center items-center rounded-lg"
              >
                <Image 
                  source={icons.backWhite}
                  className="w-7 h-7 mr-2"
                  resizeMode="contain"
                />
                <Text className="text-white font-medium">Close</Text>
            </TouchableOpacity>


            <Text className="text-2xl font-bold text-gray-800">Upload File</Text>
            <View className="w-16" />
          </View>

          {/* Type Selection */}
          <Text className="text-lg font-semibold text-gray-700 mb-4">Select Type</Text>
          <View className="flex-row flex-wrap mb-6">
            {[
              { key: "book", label: "Books" },
              { key: "thesis", label: "Thesis" },
              { key: "magazine", label: "Magazine" },
              
            ].map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, type: type.key }))
                }
                className={`mr-3 mb-3 px-6 py-3 rounded-lg ${
                  formData.type === type.key
                    ? "bg-[#084526] border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`font-medium ${
                    formData.type === type.key ? "text-white" : "text-gray-700"
                  }`}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View className="space-y-6">
            <View>
              <View className="flex-row mt-2">
                <Text className="text-lg font-semibold text-gray-700 mb-2">Title </Text><Text className="text-red-600 text-lg">*</Text>
              </View>
              <TextInput
                value={formData.title}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, title: text }))
                }
                placeholder="Enter title"
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-800 bg-gray-50"
                multiline
              />
            </View>

            <View>
              <View className="flex-row mt-2">
                <Text className="text-lg font-semibold text-gray-700 mb-2">Author </Text><Text className="text-red-600 text-lg">*</Text>
              </View>
              <TextInput
                value={formData.author}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, author: text }))
                }
                placeholder="Enter author name"
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-800 bg-gray-50"
              />
            </View>

            <View>
              <View className="flex-row mt-2">
                <Text className="text-lg font-semibold text-gray-700 mb-2">Year Published </Text><Text className="text-red-600 text-lg">*</Text>
              </View>
              <TextInput
                value={formData.yearPublished}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, yearPublished: text }))
                }
                placeholder="Enter year published"
                keyboardType="numeric"
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-800 bg-gray-50"
              />
            </View>
          </View>

          {/* File Upload */}
          <TouchableOpacity
            onPress={pickFile}
            className="mt-6 bg-gray-200 py-4 rounded-lg border-2 border-dashed border-gray-400"
          >
            <Text className="text-gray-600 text-center font-medium">
              📄 {filePath ? "File Selected" : "Select File to Upload"}
            </Text>
          </TouchableOpacity>

          {/* Action Button */}
          <View className="mt-8 flex-row space-x-4">
            <TouchableOpacity
              onPress={saveToDB}
              className="flex-1 bg-[#084526] py-4 rounded-lg"
            >
              <Text className="text-white text-center font-bold text-lg">
                Add Item
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Home page with buttons
  return (
    <SafeAreaView className="items-center justify-center w-full h-full ">
      <Image 
        source={icons.background}
        className="flex-1 w-full h-full absolute"
        resizeMode="cover"
      />
    <View className="w-full h-full justify-between items-center">
      <View className="w-full py-5 px-10 flex-row items-center justify-between">
       
          <CloseButton />
       
        
        <View />
      </View>


      {/* Upload Instructions */}
      <View className="px-5 py-3 rounded-3xl w-[65%] mb-8 justify-center items-center bg-white/90 flex-row">
        <View className="justify-center items-center w-1/3">
            <CustomButton 
              title="Upload" 
              handlePress={() => setShowAddPage(true)} 
              textStyles="text-white"
              icon={icons.upload}
              iconStyle="w-7 h-7"
              containerStyles="bg-[#084526]  rounded-full"
            />
          </View>
        <View>
              <Text className="text-xl font-psemibold text-gray-800 text-center mb-2">
                How to Upload Files
              </Text>
              <Text className="text-sm text-gray-700 mb-1">1️⃣ Tap the <Text className="font-semibold text-green-700">Upload</Text> button.</Text>
              <Text className="text-sm text-gray-700 mb-1">2️⃣ Choose a file from your device (PDF).</Text>
              <Text className="text-sm text-gray-700 mb-1">3️⃣ Enter details such as <Text className="font-semibold">Title, Author, and Year Published</Text>.</Text>
              <Text className="text-sm text-gray-700 mb-1">4️⃣ Select the correct <Text className="font-semibold">Category</Text> (Book, Thesis, or Magazine).</Text>
              <Text className="text-sm text-gray-700 mb-1">5️⃣ Press <Text className="font-semibold text-green-700">Save</Text> to upload to the archive.</Text>

              <Text className="text-sm text-gray-500 mt-3 text-center">
                📌 Note: Uploaded files will be stored in the library system and can be viewed or deleted later.
              </Text>
        </View>
      </View>


    </View>
    
</SafeAreaView>

  );
}
