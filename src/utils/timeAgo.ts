// Make sure to import Firestore types
import { Timestamp } from 'firebase/firestore'; // For modular SDK v9+
// OR
// import firebase from 'firebase/app'; // For compat SDK
// import 'firebase/firestore';

type TimeAgoInput = string | Date | Timestamp;

export function timeAgo(dateInput: TimeAgoInput): string {
  let date: Date;

  if (dateInput instanceof Timestamp) {
    // Firestore Timestamp
    date = dateInput.toDate();
  } else if (typeof dateInput === 'string') {
    // ISO string
    date = new Date(dateInput);
  } else {
    // Already a Date object
    date = dateInput;
  }

  // Validate date
  if (isNaN(date.getTime())) {
    console.error('Invalid date provided to timeAgo:', dateInput);
    return 'Invalid date';
  }

  // Continue with your existing logic...
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
  });
}
