import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Hook that subscribes to real-time changes on the appointments table.
 * Falls back to polling every 5s if Supabase is not configured.
 *
 * @param {Function} onUpdate - Callback when data changes
 */
export function useRealtime(onUpdate) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      // Fallback: poll every 5 seconds
      const interval = setInterval(() => {
        onUpdate();
      }, 5000);
      return () => clearInterval(interval);
    }

    // Subscribe to real-time changes
    const channel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [onUpdate]);
}
