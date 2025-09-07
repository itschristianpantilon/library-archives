import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from '../components/CustomButton';
import { Redirect, router } from "expo-router";
import icons from '../constants/icons';

const Home = () => {
  return (
<SafeAreaView className="flex-1 items-center justify-center bg-green-200">

  <View className="w-full h-full items-center justify-center">
    
    {/* Welcome Text */}
    <View className="screen-center flex-1 absolute">
      <Text className="text-7xl font-pprimary text-green-600">WELCOME TO SLSU</Text>
      <Text className="text-5xl font-pprimary text-green-600">LIBRARY ARCHIVE'S</Text>

      {/* App Description */}
      <View className="mt-5 w-[80%]">
        <Text className="text-md text-gray-600 font-pmedium text-center">
          The SLSU Library Archive System is a digital repository designed to
          help students, teachers, and researchers easily 
          <Text className="font-semibold"> upload</Text>, 
          <Text className="font-semibold"> view</Text>, and 
          <Text className="font-semibold"> manage</Text> 
          important academic resources such as books, theses, and magazines. 
          This system ensures faster access to knowledge while keeping all 
          library materials organized and accessible anytime.
        </Text>
      </View>
    </View>

    {/* Action Buttons */}
    <View className="items-end justify-center w-full h-full gap-10 px-5 flex-row py-5 absolute">
      <CustomButton 
        title="Add"
        handlePress={() => router.push('(add)')}
        icon={icons.add}
        iconStyle="w-7 h-7"
        textStyles="text-white"
      />
      <CustomButton 
        title="View"
        handlePress={() => router.push('(view)')}
        icon={icons.view}
        iconStyle="w-7 h-7"
        containerStyles=""
        textStyles="text-white"
      />
      <CustomButton 
        title="Delete"
        handlePress={() => router.push('(delete)')}
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
