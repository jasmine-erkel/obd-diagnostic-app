export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  vehicleCount: number;
  scanCount: number;
  issuesResolvedCount: number;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}
