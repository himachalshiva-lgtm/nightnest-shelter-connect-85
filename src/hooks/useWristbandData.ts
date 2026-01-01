import { useState, useCallback } from 'react';
import { db } from '@/integrations/firebase/config';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { WristbandProfile, Shelter } from '@/types/shelter';
import { getRecommendedShelter } from '@/lib/geoUtils';
import { mockShelters } from '@/data/mockData';

interface WristbandRecord {
  id: string;
  wristband_id: string;
  last_check_in: Timestamp | null;
  last_shelter_name: string | null;
  health_notes: string[];
  check_in_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface CheckInHistoryRecord {
  wristband_id: string;
  shelter_id: string;
  shelter_name: string;
  check_in_time: Timestamp;
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
      const wristbandRef = doc(db, 'wristbands', wristbandId);
      const wristbandSnap = await getDoc(wristbandRef);

      const recommendedShelter = getRecommendedShelter(
        userLocation || { lat: 40.7580, lng: -73.9855 },
        mockShelters
      );

      if (wristbandSnap.exists()) {
        // Return existing wristband as profile
        const record = wristbandSnap.data() as WristbandRecord;
        return {
          id: wristbandSnap.id,
          wristbandId: record.wristband_id,
          lastCheckIn: record.last_check_in?.toDate().toISOString().split('T')[0] || undefined,
          lastShelter: record.last_shelter_name || undefined,
          healthNotes: record.health_notes || [],
          checkInCount: record.check_in_count,
          recommendedShelter,
        };
      }

      // Create new wristband
      const newWristband = {
        wristband_id: wristbandId,
        health_notes: ['No known allergies', 'New registration'],
        check_in_count: 0,
        last_check_in: null,
        last_shelter_name: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      await setDoc(wristbandRef, newWristband);

      return {
        id: wristbandId,
        wristbandId: wristbandId,
        lastCheckIn: undefined,
        lastShelter: undefined,
        healthNotes: ['No known allergies', 'New registration'],
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
      const checkInHistoryRef = collection(db, 'check_in_history');
      await addDoc(checkInHistoryRef, {
        wristband_id: wristbandId,
        shelter_id: shelter.id,
        shelter_name: shelter.name,
        check_in_time: serverTimestamp(),
      });

      // Get current wristband data
      const wristbandRef = doc(db, 'wristbands', wristbandId);
      const wristbandSnap = await getDoc(wristbandRef);
      const currentCount = wristbandSnap.exists()
        ? (wristbandSnap.data() as WristbandRecord).check_in_count || 0
        : 0;

      // Update wristband record
      await updateDoc(wristbandRef, {
        last_check_in: serverTimestamp(),
        last_shelter_name: shelter.name,
        check_in_count: currentCount + 1,
        updated_at: serverTimestamp(),
      });

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
      const historyRef = collection(db, 'check_in_history');
      const q = query(
        historyRef,
        where('wristband_id', '==', wristbandId),
        orderBy('check_in_time', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const history: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as CheckInHistoryRecord;
        history.push({
          id: doc.id,
          ...data,
          check_in_time: data.check_in_time?.toDate().toISOString(),
        });
      });

      return history;
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
