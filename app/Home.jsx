import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from '../components/CustomButton';
import { Redirect, router } from "expo-router";
import icons from '../constants/icons';

const Home = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-green-100">

      <View className="w-full h-full items-center justify-center">
      
        <View className="screen-center flex-1">
          <Text className="text-7xl font-pprimary text-green-600">WELCOME TO SLSU</Text>
            <Text className="text-5xl font-pprimary text-green-600">LIBRARY ARCHIVE`S</Text>
        </View>

        <View className="screen-center w-full gap-10 px-5 flex-row py-5">
          <CustomButton 
            title="Add"
            handlePress={()=> router.push('(add)')}
            icon={icons.add}
            iconStyle="w-7 h-7"
            textStyles="text-white"
          />
          <CustomButton 
            title="View"
            handlePress={()=> router.push('(view)')}
            icon={icons.view}
            iconStyle="w-7 h-7"
            containerStyles=""
            textStyles="text-white"
          />
          <CustomButton 
            title="Delete"
            handlePress={()=> router.push('(delete)')}
            icon={icons.deleteIcon}
            iconStyle="w-7 h-7"
            textStyles="text-white"
          />
        </View>

      </View>
    </SafeAreaView>
    
  );
}

export default Home
