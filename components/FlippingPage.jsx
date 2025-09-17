// import Animated, { 
//   useSharedValue, 
//   useAnimatedStyle, 
//   withTiming, 
//   interpolate 
// } from "react-native-reanimated";
// import { PanGestureHandler } from "react-native-gesture-handler";
// import { Dimensions } from "react-native";

// const { width, height } = Dimensions.get("window");

// export function FlippingPage({ children, onFlipEnd, direction = "right" }) {
//   const rotate = useSharedValue(0);

//   const animatedStyle = useAnimatedStyle(() => {
//     const rotation = interpolate(rotate.value, [0, 1], [0, direction === "right" ? -180 : 180]);
//     return {
//       transform: [
//         { perspective: 1000 }, 
//         { rotateY: `${rotation}deg` }
//       ]
//     };
//   });

//   const handleGesture = (event) => {
//     if (event.nativeEvent.translationX < -50 && direction === "right") {
//       rotate.value = withTiming(1, { duration: 600 }, () => {
//         onFlipEnd?.();
//         rotate.value = 0;
//       });
//     } else if (event.nativeEvent.translationX > 50 && direction === "left") {
//       rotate.value = withTiming(1, { duration: 600 }, () => {
//         onFlipEnd?.();
//         rotate.value = 0;
//       });
//     }
//   };

//   return (
//     <PanGestureHandler onEnded={handleGesture}>
//       <Animated.View 
//         style={[
//           { width: width / 2, height: height, backgroundColor: "#fff" }, 
//           animatedStyle
//         ]}
//       >
//         {children}
//       </Animated.View>
//     </PanGestureHandler>
//   );
// }
