import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.obddiagnosticapp.auth';

export const secureStorage = {
  /**
   * Save authentication token securely
   */
  async saveToken(token: string): Promise<boolean> {
    try {
      // Check if Keychain is available
      if (!Keychain || typeof Keychain.setGenericPassword !== 'function') {
        console.warn('Keychain not available, skipping token storage');
        return false;
      }

      await Keychain.setGenericPassword('auth_token', token, {
        service: SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
      return true;
    } catch (error) {
      console.warn('Error saving token (non-critical):', error);
      return false;
    }
  },

  /**
   * Retrieve authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  /**
   * Delete authentication token
   */
  async deleteToken(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: SERVICE_NAME,
      });
      return true;
    } catch (error) {
      console.error('Error deleting token:', error);
      return false;
    }
  },

  /**
   * Check if token exists
   */
  async hasToken(): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
      return !!credentials;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  },
};
