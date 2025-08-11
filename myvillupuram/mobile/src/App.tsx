import React, { useEffect, useLayoutEffect } from 'react';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, IconButton } from 'react-native-paper';
import NewsScreen from './screens/NewsScreen';
import DirectoryScreen from './screens/DirectoryScreen';
import JobsScreen from './screens/JobsScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import TransportScreen from './screens/TransportScreen';
import './i18n';
import i18n from './i18n';
import { requestUserPermissionAndToken } from './notifications';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

function HeaderLangToggle() {
  const nav = useNavigation();
  useLayoutEffect(() => {
    nav.setOptions?.({
      headerRight: () => (
        <IconButton
          icon="translate"
          onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')}
          accessibilityLabel="Toggle language"
        />
      ),
    });
  }, [nav]);
  return null;
}

export default function App() {
  useEffect(() => {
    requestUserPermissionAndToken().catch(() => {});
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer theme={DefaultTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            tabBarIcon: ({ color, size }) => {
              const map: Record<string, string> = {
                News: 'newspaper-variant',
                Directory: 'store-search',
                Jobs: 'briefcase',
                Marketplace: 'cart',
                Transport: 'train-car',
              };
              const name = map[route.name] || 'dots-horizontal';
              return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="News" component={NewsScreen} options={{ tabBarLabel: 'News' }} />
          <Tab.Screen name="Directory" component={DirectoryScreen} />
          <Tab.Screen name="Jobs" component={JobsScreen} />
          <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
          <Tab.Screen name="Transport" component={TransportScreen} />
        </Tab.Navigator>
        <HeaderLangToggle />
      </NavigationContainer>
    </PaperProvider>
  );
}