import { Image, Text, TouchableOpacity, View } from 'react-native'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, icon, iconStyle }) => {
  return (
   <TouchableOpacity 
    className={`bg-green-600 w-28 rounded-md min-h-[50px] px-4 py-2 items-center justify-center flex-row ${containerStyles} ${isLoading ? 'opacity-50': ''} hover:opacity-50`}
    disabled={isLoading}
    onPress={handlePress}
    activeOpacity={0.7}
    >

        <Image 
          source={icon}
          className={`${iconStyle} mr-2`}
          resizeMode='contain'
        />

      <Text className={`text-black font-pregular text-md px-1 ${textStyles}`}>{title}</Text>
      
    </TouchableOpacity>
  )
}

export default CustomButton