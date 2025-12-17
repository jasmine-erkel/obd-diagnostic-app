import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserProfile, UserStats, UserSettings} from '../types/user';

const USER_PROFILE_KEY = '@obd_user_profile';
const USER_STATS_KEY = '@obd_user_stats';
const USER_SETTINGS_KEY = '@obd_user_settings';

export const userStorage = {
  // Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  },

  // Save user profile
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  },

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) {
        return false;
      }

      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  // Get user stats
  async getUserStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(USER_STATS_KEY);
      return data
        ? JSON.parse(data)
        : {vehicleCount: 0, scanCount: 0, issuesResolvedCount: 0};
    } catch (error) {
      console.error('Error loading user stats:', error);
      return {vehicleCount: 0, scanCount: 0, issuesResolvedCount: 0};
    }
  },

  // Update user stats
  async updateUserStats(stats: Partial<UserStats>): Promise<boolean> {
    try {
      const currentStats = await this.getUserStats();
      const updatedStats = {
        ...currentStats,
        ...stats,
      };
      await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(updatedStats));
      return true;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  },

  // Get user settings
  async getUserSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(USER_SETTINGS_KEY);
      return data
        ? JSON.parse(data)
        : {
            notificationsEnabled: true,
            emailNotifications: true,
            pushNotifications: true,
            theme: 'auto',
          };
    } catch (error) {
      console.error('Error loading user settings:', error);
      return {
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        theme: 'auto',
      };
    }
  },

  // Update user settings
  async updateUserSettings(settings: Partial<UserSettings>): Promise<boolean> {
    try {
      const currentSettings = await this.getUserSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };
      await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  },

  // Clear all user data (for sign out)
  async clearAllUserData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        USER_PROFILE_KEY,
        USER_STATS_KEY,
        USER_SETTINGS_KEY,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  },

  // Initialize default user profile (for first time setup)
  async initializeDefaultProfile(profile: UserProfile): Promise<boolean> {
    try {
      const existingProfile = await this.getUserProfile();
      if (!existingProfile) {
        await this.saveUserProfile(profile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing default profile:', error);
      return false;
    }
  },
};
