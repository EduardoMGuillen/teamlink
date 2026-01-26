import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
// Usa variables de entorno si están disponibles, sino usa valores por defecto
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kybuzwcmkprghxzsuagc.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YnV6d2Nta3ByZ2h4enN1YWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTI4NjksImV4cCI6MjA4NDc4ODg2OX0.Z4O-MfAKeTe8jmbQAwe184ojrNic9PamQAtwCxHQgF4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Configuración para mantener sesiones más tiempo
    flowType: 'pkce',
  },
});
