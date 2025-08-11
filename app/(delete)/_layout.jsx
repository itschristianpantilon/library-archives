import { Stack } from "expo-router";
import '../../app/global.css';

const DeleteLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
    </Stack>
  );
}

export default DeleteLayout
