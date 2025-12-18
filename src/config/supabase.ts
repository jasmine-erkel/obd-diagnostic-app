import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded temporarily to test
const SUPABASE_URL = 'https://ecxxkvyzmonjnfsmfusq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeHhrdnl6bW9uam5mc21mdXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDM4NTYsImV4cCI6MjA4MTU3OTg1Nn0.AHGO_N88NUaDdIeXrj3NqXXerM-I4FJ6bZUrfRnAaW0';

console.log('Supabase Config - Hardcoded credentials');
console.log('URL:', SUPABASE_URL);

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
