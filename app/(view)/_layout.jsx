import { Stack } from "expo-router";
import '../../app/global.css';

const ViewLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
    </Stack>
  );
}

export default ViewLayout
