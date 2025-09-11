import { Image, Text, TouchableOpacity } from 'react-native'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, icon, iconStyle }) => {
  return (
   <TouchableOpacity 
    className={`w-40 h-[70px] px-6 py-4 items-center justify-center flex-row ${containerStyles} ${isLoading ? 'opacity-50': ''} hover:opacity-50`}
    disabled={isLoading}
    onPress={handlePress}
    activeOpacity={0.7}
    >

        <Image 
          source={icon}
          className={`${iconStyle} mr-2`}
          resizeMode='contain'
        />

      <Text className={`text-black font-psemibold text-lg px-1 ${textStyles}`}>{title}</Text>
      
    </TouchableOpacity>
  )
}

export default CustomButton