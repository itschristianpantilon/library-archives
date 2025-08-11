import { Image, Text, TouchableOpacity, View } from 'react-native'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, icon, iconStyle }) => {
  return (
   <TouchableOpacity 
    className={`border bg-white w-24 rounded-2xl min-h-[50px] py-2 items-center justify-center ${containerStyles} ${isLoading ? 'opacity-50': ''} hover:opacity-50`}
    disabled={isLoading}
    onPress={handlePress}
    activeOpacity={0.7}
    >

        <Image 
          source={icon}
          className={iconStyle}
          resizeMode='contain'
        />

      <Text className={`text-black font-psemibold text-md ${textStyles}`}>{title}</Text>
      
    </TouchableOpacity>
  )
}

export default CustomButton