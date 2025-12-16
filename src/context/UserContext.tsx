import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {UserProfile, UserStats, UserSettings} from '../types/user';
import {userStorage} from '../services/userStorage';

interface UserContextType {
  profile: UserProfile | null;
  stats: UserStats;
  settings: UserSettings;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateStats: (stats: Partial<UserStats>) => Promise<boolean>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  initializeProfile: (profile: UserProfile) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    vehicleCount: 0,
    scanCount: 0,
    issuesResolvedCount: 0,
  });
  const [settings, setSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    theme: 'auto',
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const [loadedProfile, loadedStats, loadedSettings] = await Promise.all([
        userStorage.getUserProfile(),
        userStorage.getUserStats(),
        userStorage.getUserSettings(),
      ]);
      setProfile(loadedProfile);
      setStats(loadedStats);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    const success = await userStorage.updateUserProfile(updates);
    if (success) {
      await refreshUser();
    }
    return success;
  };

  const updateStats = async (statsUpdate: Partial<UserStats>): Promise<boolean> => {
    const success = await userStorage.updateUserStats(statsUpdate);
    if (success) {
      await refreshUser();
    }
    return success;
  };

  const updateSettings = async (settingsUpdate: Partial<UserSettings>): Promise<boolean> => {
    const success = await userStorage.updateUserSettings(settingsUpdate);
    if (success) {
      await refreshUser();
    }
    return success;
  };

  const signOut = async (): Promise<boolean> => {
    const success = await userStorage.clearAllUserData();
    if (success) {
      setProfile(null);
      setStats({vehicleCount: 0, scanCount: 0, issuesResolvedCount: 0});
      setSettings({
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        theme: 'auto',
      });
    }
    return success;
  };

  const initializeProfile = async (newProfile: UserProfile): Promise<boolean> => {
    const success = await userStorage.initializeDefaultProfile(newProfile);
    if (success) {
      await refreshUser();
    }
    return success;
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        profile,
        stats,
        settings,
        loading,
        refreshUser,
        updateProfile,
        updateStats,
        updateSettings,
        signOut,
        initializeProfile,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
