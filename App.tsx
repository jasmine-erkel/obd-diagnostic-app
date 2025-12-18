import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/AuthContext';
import {VehicleProvider} from './src/context/VehicleContext';
import {AIProvider} from './src/context/AIContext';
import {OBDProvider} from './src/context/OBDContext';
import {UserProvider} from './src/context/UserContext';
import {RootNavigator} from './src/navigation/RootNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProvider>
          <VehicleProvider>
            <AIProvider>
              <OBDProvider>
                <StatusBar barStyle="dark-content" />
                <RootNavigator />
              </OBDProvider>
            </AIProvider>
          </VehicleProvider>
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
