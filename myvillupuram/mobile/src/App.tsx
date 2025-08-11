import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import NewsScreen from './screens/NewsScreen';
import DirectoryScreen from './screens/DirectoryScreen';
import JobsScreen from './screens/JobsScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import TransportScreen from './screens/TransportScreen';
import './i18n';
import { requestUserPermissionAndToken } from './notifications';
import PhoneAuth from './auth/PhoneAuth';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Directory" component={DirectoryScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Transport" component={TransportScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    requestUserPermissionAndToken().catch(() => {});
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer theme={DefaultTheme}>
        <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={PhoneAuth} />
          <Stack.Screen name="Tabs" component={Tabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}