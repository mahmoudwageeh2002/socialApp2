import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredNotification = {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string; // UI-friendly like "1m"
  createdAt: number; // unix ms for sorting
};

const KEY = '@notifications:list:v1';
const MAX_ITEMS = 100;

function timeAgo(createdAt: number): string {
  const diffMs = Date.now() - createdAt;
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  return `${w}w`;
}

async function readAll(): Promise<StoredNotification[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(list: StoredNotification[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
}

export async function addNotification(
  n: Omit<StoredNotification, 'time'>,
): Promise<StoredNotification[]> {
  const list = await readAll();
  const next: StoredNotification[] = [
    { ...n, time: timeAgo(n.createdAt) },
    ...list.filter(x => x.id !== n.id),
  ].slice(0, MAX_ITEMS);

  await writeAll(next);
  return next;
}

export async function clearNotifications() {
  await AsyncStorage.removeItem(KEY);
}

export function useNotifications() {
  const [items, setItems] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await readAll();
    // refresh time labels
    const hydrated = list
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(x => ({ ...x, time: timeAgo(x.createdAt) }));
    setItems(hydrated);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh, setItems };
}
