import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  HomeScreen,
  SessionScreen,
  CompletionScreen,
  SettingsScreen,
  ReviewDeletionScreen,
} from './src/screens';
import { RootStackParamList } from './src/types/navigation';
import { COLORS } from './src/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Session"
              component={SessionScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="Completion"
              component={CompletionScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ReviewDeletion" component={ReviewDeletionScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
