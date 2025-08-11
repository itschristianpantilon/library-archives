import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import icons from '../constants/icons';
import { router, usePathname } from 'expo-router'

const SearchInput = ({ initialQuery, placeholder }) => {

    const pathname = usePathname();
    const [query, setQuery] = useState(initialQuery || '');
  return (

      <View className='h-16 w-1/2 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary items-center flex-row space-x-4 '>
        <TextInput 
            className='text-base mt-0.5 text-black flex-1 font-pregular'
            value={query}
            placeholder={placeholder}
            placeholderTextColor="#000"
            onChangeText={(e) => setQuery(e)}
        />

        <TouchableOpacity className="w-7 h-7">
            <Image 
                source={icons.search}
                className="w-full h-full"
                resizeMode='contain'
            />
        </TouchableOpacity>
      </View>
  )
}

export default SearchInput