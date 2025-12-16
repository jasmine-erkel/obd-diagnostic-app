import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {VehicleProvider} from './src/context/VehicleContext';
import {AIProvider} from './src/context/AIContext';
import {TabNavigator} from './src/navigation/TabNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <VehicleProvider>
        <AIProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" />
            <TabNavigator />
          </NavigationContainer>
        </AIProvider>
      </VehicleProvider>
    </SafeAreaProvider>
  );
}

export default App;
