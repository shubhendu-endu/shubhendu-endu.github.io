export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
}

export function formatIntervalLabel(mins: number): string {
  if (mins < 60) return `${mins} Minutes`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${hrs} Hour${hrs > 1 ? 's' : ''}`;
  return `${hrs}h ${rem}m`;
}

// Convert "HH:MM" string to minutes from start of day
export function parseTimeString(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Format minutes from start of day to "hh:mm AM/PM"
export function formatTime12Hour(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 should be 12
  const formattedMinutes = m < 10 ? `0${m}` : m;
  return `${h}:${formattedMinutes} ${ampm}`;
}

// Check if a given Date is within the active reminder hours
export function isWithinActiveHours(now: Date, startTimeStr: string, endTimeStr: string): {
  isActive: boolean;
  reason?: string;
  nextActiveTimeStr?: string;
} {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeString(startTimeStr);
  const endMinutes = parseTimeString(endTimeStr);

  if (startMinutes <= endMinutes) {
    // Normal window, e.g., 08:00 to 22:00
    const isActive = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    return {
      isActive,
      reason: isActive ? undefined : 'Outside active hours (Sleeping hours)',
      nextActiveTimeStr: formatTime12Hour(startTimeStr),
    };
  } else {
    // Overnight window, e.g., 20:00 to 06:00
    const isActive = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    return {
      isActive,
      reason: isActive ? undefined : 'Outside active hours',
      nextActiveTimeStr: formatTime12Hour(startTimeStr),
    };
  }
}

// Format countdown remaining seconds
export function formatCountdown(totalSeconds: number): {
  display: string;
  isOverdue: boolean;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const isOverdue = totalSeconds <= 0;
  const absSec = Math.abs(totalSeconds);
  const hours = Math.floor(absSec / 3600);
  const minutes = Math.floor((absSec % 3600) / 60);
  const seconds = absSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return {
      display: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      isOverdue,
      hours,
      minutes,
      seconds,
    };
  }
  return {
    display: `${pad(minutes)}:${pad(seconds)}`,
    isOverdue,
    hours,
    minutes,
    seconds,
  };
}

export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
