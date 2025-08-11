import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import icons from '../constants/icons'
import { router } from 'expo-router'

const CloseButton = () => {
  return (
    <TouchableOpacity onPress={()=> router.back()}>
      <Image 
        source={icons.close}
        className="w-14 h-14"
        resizeMode='contain'
      />
    </TouchableOpacity>
  )
}

export default CloseButton