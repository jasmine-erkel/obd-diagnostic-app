import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {VehiclesStackParamList} from './types';
import {VehicleListScreen} from '../screens/VehicleListScreen';
import {AddVehicleScreen} from '../screens/AddVehicleScreen';
import {VehicleDetailScreen} from '../screens/VehicleDetailScreen';
import {colors} from '../constants/theme';

const Stack = createNativeStackNavigator<VehiclesStackParamList>();

export const VehiclesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Stack.Screen
        name="VehicleList"
        component={VehicleListScreen}
        options={{
          headerShown: false, // Tab navigator already shows header
        }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          title: 'Add Vehicle',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{
          title: 'Vehicle Details',
        }}
      />
    </Stack.Navigator>
  );
};
