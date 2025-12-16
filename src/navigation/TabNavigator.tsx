import React from 'react';
import {View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TabParamList} from './types';
import {VehiclesStackNavigator} from './VehiclesStackNavigator';
import {AIAssistantScreen} from '../screens/AIAssistantScreen';
import {DiagnosticsScreen} from '../screens/DiagnosticsScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {colors} from '../constants/theme';

const Tab = createBottomTabNavigator<TabParamList>();

// Hollow circle icon component
const TabIcon: React.FC<{focused: boolean}> = ({focused}) => {
  return (
    <View
      style={[
        styles.iconCircle,
        focused ? styles.iconCircleFocused : styles.iconCircleUnfocused,
      ]}
    />
  );
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.borderLight,
          paddingTop: 8,
          paddingBottom: 24,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="VehiclesTab"
        component={VehiclesStackNavigator}
        options={{
          title: 'Vehicles',
          tabBarLabel: 'Vehicles',
          tabBarIcon: ({focused}) => <TabIcon focused={focused} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AIAssistantTab"
        component={AIAssistantScreen}
        options={{
          title: 'AI Assistant',
          tabBarLabel: 'AI',
          tabBarIcon: ({focused}) => <TabIcon focused={focused} />,
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="DiagnosticsTab"
        component={DiagnosticsScreen}
        options={{
          title: 'Diagnostics',
          tabBarLabel: 'Diagnostics',
          tabBarIcon: ({focused}) => <TabIcon focused={focused} />,
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) => <TabIcon focused={focused} />,
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  iconCircleFocused: {
    borderColor: colors.tabBarActive,
    backgroundColor: colors.tabBarActive + '20', // Slight fill when active
  },
  iconCircleUnfocused: {
    borderColor: colors.tabBarInactive,
    backgroundColor: 'transparent',
  },
});
