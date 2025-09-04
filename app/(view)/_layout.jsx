import { Stack } from "expo-router";

const ViewLayout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name='index' 
        options={{ 
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right'
        }} 
      />
    </Stack>
  );
}

export default ViewLayout;