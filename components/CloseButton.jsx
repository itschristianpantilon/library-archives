import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import icons from '../constants/icons'
import { router } from 'expo-router'

const CloseButton = () => {
  return (
    <TouchableOpacity className="flex-row items-center justify-center" onPress={()=> router.back()}>
      <Image 
        source={icons.backWhite}
        className="w-12 h-12 mr-2"
        resizeMode='contain'
      />

      <Text className="font-pregular text-sm text-white">Back</Text>
    </TouchableOpacity>
  )
}

export default CloseButton