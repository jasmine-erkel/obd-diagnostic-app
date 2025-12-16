import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';

// Tab navigator param list
export type TabParamList = {
  VehiclesTab: undefined;
  AIAssistantTab: undefined;
  DiagnosticsTab: undefined;
  ProfileTab: undefined;
};

// Vehicles stack param list
export type VehiclesStackParamList = {
  VehicleList: undefined;
  AddVehicle: undefined;
  VehicleDetail: { vehicleId: string };
};

// Screen props types
export type VehiclesTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'VehiclesTab'>,
  NativeStackScreenProps<VehiclesStackParamList>
>;

export type VehicleListScreenProps = NativeStackScreenProps<
  VehiclesStackParamList,
  'VehicleList'
>;

export type AddVehicleScreenProps = NativeStackScreenProps<
  VehiclesStackParamList,
  'AddVehicle'
>;

export type VehicleDetailScreenProps = NativeStackScreenProps<
  VehiclesStackParamList,
  'VehicleDetail'
>;

export type AIAssistantScreenProps = BottomTabScreenProps<
  TabParamList,
  'AIAssistantTab'
>;

export type DiagnosticsScreenProps = BottomTabScreenProps<
  TabParamList,
  'DiagnosticsTab'
>;

export type ProfileScreenProps = BottomTabScreenProps<
  TabParamList,
  'ProfileTab'
>;

// Declare global navigation types for type-safe navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabParamList, VehiclesStackParamList {}
  }
}
