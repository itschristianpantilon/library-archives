import { View, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import icons from '../constants/icons';

const SearchInput = ({ initialQuery, placeholder, onSearch }) => {
  const [query, setQuery] = useState(initialQuery || '');

  const handleChange = (text) => {
    setQuery(text);
    if (onSearch) {
      onSearch(text); // 🔥 send query back to parent
    }
  };

  return (
    <View className='h-16 w-1/2 px-4 bg-white rounded-2xl  border-black-200 items-center flex-row space-x-4 '>
      <TextInput 
        className='text-base mt-0.5 text-black flex-1 font-plight'
        value={query}
        placeholder={placeholder}
        placeholderTextColor="#000"
        onChangeText={handleChange}
      />

      <TouchableOpacity className="w-7 h-7" onPress={() => onSearch?.(query)}>
        <Image 
          source={icons.search}
          className="w-full h-full"
          resizeMode='contain'
        />
      </TouchableOpacity>
    </View>
  )
}

export default SearchInput;
