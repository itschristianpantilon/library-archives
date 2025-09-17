import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import icons from '../constants/icons'
import { router } from 'expo-router'

const CloseButton = () => {
  return (
    <TouchableOpacity 
      style={{ backgroundColor: "#084526" }}
      className="flex-row items-center justify-center px-4 py-2 rounded-full" 
      onPress={()=> router.back()}>
      <Image 
        source={icons.backWhite}
        className="w-8 h-8 mr-2"
        resizeMode='contain'
      />

      <Text className="font-pmedium text-xs text-white">Back</Text>
    </TouchableOpacity>
  )
}

export default CloseButton