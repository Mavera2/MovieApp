import { View } from "react-native";
import Movie from "./Movie";

export default function TabOneScreen() {
  return (
    
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }} >
     <Movie></Movie>
    </View>
  );
}

