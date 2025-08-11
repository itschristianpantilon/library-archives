import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from '../components/CustomButton';
import { Redirect, router } from "expo-router";
import icons from '../constants/icons';

const Home = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-green-100">

      <View className="w-full h-full flex-row">
        

        {/* Buttons */}
        <View className="screen-center gap-10 px-5">
          <CustomButton 
            title="Add"
            handlePress={()=> router.push('(add)')}
            icon={icons.add}
            iconStyle="w-7 h-7"
          />
          <CustomButton 
            title="View"
            handlePress={()=> router.push('(view)')}
            icon={icons.view}
            iconStyle="w-7 h-7"
          />
          <CustomButton 
            title="Delete"
            handlePress={()=> router.push('(delete)')}
            icon={icons.deleteIcon}
            iconStyle="w-7 h-7"
          />
        </View>

        <View className="screen-center flex-1">
          <Text className="text-6xl font-pextrabold">WELCOME TO SLSU</Text>
            <Text className="text-4xl font-pextrabold">LIBRARY ARCHIVE`S</Text>
        </View>

      </View>
    </SafeAreaView>
    
  );
}

export default Home
