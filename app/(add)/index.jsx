import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from '../../components/CustomButton';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <View className="w-full h-full flex-row">
        

        {/* Buttons */}
        <View className="screen-center gap-10 px-5">
          <CustomButton 
            title="Add"
          />
          <CustomButton 
            title="View"
          />
          <CustomButton 
            title="Delete"
          />
        </View>

        <View className="screen-center flex-1">
          <View className="screen-center w-full">
            <Text className="text-6xl font-pextrabold">WELCOME TO SLSU</Text>
            <Text className="text-4xl font-pextrabold">LIBRARY ARCHIVE`S</Text>
          </View>

            <View className="w-full flex-row screen-center gap-3">
              <CustomButton 
                title="Scan"
              />
              <CustomButton 
                title="Upload"
              />
            </View>

        </View>


      </View>
    </SafeAreaView>
    
  );
}
