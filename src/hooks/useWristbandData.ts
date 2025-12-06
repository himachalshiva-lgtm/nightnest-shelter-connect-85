import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WristbandProfile, Shelter } from '@/types/shelter';
import { getRecommendedShelter } from '@/lib/geoUtils';
import { mockShelters } from '@/data/mockData';

interface WristbandRecord {
  id: string;
  wristband_id: string;
  last_check_in: string | null;
  last_shelter_name: string | null;
  health_notes: string[];
  check_in_count: number;
  created_at: string;
  updated_at: string;
}

export function useWristbandData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch or create a wristband profile by ID
  const getOrCreateWristband = useCallback(async (
    wristbandId: string,
    userLocation?: { lat: number; lng: number }
  ): Promise<WristbandProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch existing wristband
      const { data: existing, error: fetchError } = await supabase
        .from('wristbands')
        .select('*')
        .eq('wristband_id', wristbandId)
        .maybeSingle();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const recommendedShelter = getRecommendedShelter(
        userLocation || { lat: 40.7580, lng: -73.9855 },
        mockShelters
      );

      if (existing) {
        // Return existing wristband as profile
        const record = existing as WristbandRecord;
        return {
          id: record.id,
          wristbandId: record.wristband_id,
          lastCheckIn: record.last_check_in?.split('T')[0] || undefined,
          lastShelter: record.last_shelter_name || undefined,
          healthNotes: record.health_notes || [],
          checkInCount: record.check_in_count,
          recommendedShelter,
        };
      }

      // Create new wristband
      const { data: newWristband, error: insertError } = await supabase
        .from('wristbands')
        .insert({
          wristband_id: wristbandId,
          health_notes: ['No known allergies', 'New registration'],
          check_in_count: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const newRecord = newWristband as WristbandRecord;
      return {
        id: newRecord.id,
        wristbandId: newRecord.wristband_id,
        lastCheckIn: undefined,
        lastShelter: undefined,
        healthNotes: newRecord.health_notes || [],
        checkInCount: 0,
        recommendedShelter,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch wristband';
      setError(message);
      console.error('Wristband fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Record a check-in
  const recordCheckIn = useCallback(async (
    wristbandId: string,
    shelter: Shelter
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Insert check-in history
      const { error: historyError } = await supabase
        .from('check_in_history')
        .insert({
          wristband_id: wristbandId,
          shelter_id: shelter.id,
          shelter_name: shelter.name,
        });

      if (historyError) {
        throw new Error(historyError.message);
      }

      // Update wristband record
      const { data: current } = await supabase
        .from('wristbands')
        .select('check_in_count')
        .eq('wristband_id', wristbandId)
        .single();

      const currentCount = (current as { check_in_count: number } | null)?.check_in_count || 0;

      const { error: updateError } = await supabase
        .from('wristbands')
        .update({
          last_check_in: new Date().toISOString(),
          last_shelter_name: shelter.name,
          check_in_count: currentCount + 1,
        })
        .eq('wristband_id', wristbandId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record check-in';
      setError(message);
      console.error('Check-in error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get check-in history for a wristband
  const getCheckInHistory = useCallback(async (wristbandId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('check_in_history')
        .select('*')
        .eq('wristband_id', wristbandId)
        .order('check_in_time', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(message);
      console.error('History fetch error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getOrCreateWristband,
    recordCheckIn,
    getCheckInHistory,
  };
}
