import { Stack } from "expo-router";
import '../../app/global.css';

const AddLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='index' 
        options={{ 
          headerShown: false,
          presentation: 'card',
          animation: 'none'
        }} />
    </Stack>
  );
}

export default AddLayout
