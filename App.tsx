import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {VehicleProvider} from './src/context/VehicleContext';
import {AIProvider} from './src/context/AIContext';
import {OBDProvider} from './src/context/OBDContext';
import {UserProvider} from './src/context/UserContext';
import {TabNavigator} from './src/navigation/TabNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <VehicleProvider>
          <AIProvider>
            <OBDProvider>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" />
                <TabNavigator />
              </NavigationContainer>
            </OBDProvider>
          </AIProvider>
        </VehicleProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
