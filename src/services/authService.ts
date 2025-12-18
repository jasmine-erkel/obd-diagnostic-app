import {supabase} from '../config/supabase';
import {secureStorage} from './secureStorage';
import {User, Session, AuthError} from '@supabase/supabase-js';

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export const authService = {
  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    try {
      console.log('authService: Calling Supabase signUp...');
      const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      console.log('authService: Supabase response:', {
        hasError: !!error,
        errorMessage: error?.message,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
      });

      if (error) {
        console.log('authService: Registration failed with error:', error.message);
        return {success: false, error: error.message};
      }

      // Registration succeeded even if no session (means email confirmation is required)
      if (data.user) {
        if (data.session) {
          await secureStorage.saveToken(data.session.access_token);
        }

        return {
          success: true,
          user: data.user,
          session: data.session ?? undefined,
        };
      }

      return {
        success: false,
        error: 'Registration failed - no user returned',
      };
    } catch (error) {
      console.error('authService: Exception caught during registration:', error);
      const errorMessage = error instanceof Error
        ? `${error.message} (${error.name})`
        : `Registration failed: ${JSON.stringify(error)}`;
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {success: false, error: error.message};
      }

      if (data.session) {
        await secureStorage.saveToken(data.session.access_token);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      const {error} = await supabase.auth.signOut();

      if (error) {
        return {success: false, error: error.message};
      }

      await secureStorage.deleteToken();

      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  },

  /**
   * Get current user session
   */
  async getSession(): Promise<Session | null> {
    try {
      const {data} = await supabase.auth.getSession();
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const {data} = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthResponse> {
    try {
      const {data, error} = await supabase.auth.refreshSession();

      if (error) {
        return {success: false, error: error.message};
      }

      if (data.session) {
        await secureStorage.saveToken(data.session.access_token);
      }

      return {
        success: true,
        user: data.user ?? undefined,
        session: data.session ?? undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Session refresh failed',
      };
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const {error} = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {success: false, error: error.message};
      }

      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  },
};
