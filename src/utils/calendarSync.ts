import { parseTimeString } from './timeUtils';

/**
 * Generates an iCalendar (.ics) file containing scheduled water reminder alarms
 * for today matching the user's active hours and interval gap.
 * When tapped on an iPhone, iOS automatically offers to add native Lock-Screen alerts
 * to the Apple Calendar / Reminders app that ring even when the phone is locked!
 */
export function generateIOSWaterCalendar(
  intervalMinutes: number,
  startTimeStr: string,
  endTimeStr: string,
  dailyGoalMl: number
): void {
  const startMins = parseTimeString(startTimeStr);
  const endMins = parseTimeString(endTimeStr);

  const events: string[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let currentMin = startMins;
  let count = 1;

  while (currentMin <= endMins) {
    const eventHour = Math.floor(currentMin / 60);
    const eventMinute = currentMin % 60;

    const startHStr = eventHour.toString().padStart(2, '0');
    const startMStr = eventMinute.toString().padStart(2, '0');

    // 5-minute event duration
    const endTotalMin = currentMin + 5;
    const endHStr = Math.floor(endTotalMin / 60).toString().padStart(2, '0');
    const endMStr = (endTotalMin % 60).toString().padStart(2, '0');

    const dtStart = `${year}${month}${day}T${startHStr}${startMStr}00`;
    const dtEnd = `${year}${month}${day}T${endHStr}${endMStr}00`;

    events.push(`BEGIN:VEVENT
UID:aquadrop-${year}${month}${day}-${currentMin}@aquadrop.app
DTSTAMP:${year}${month}${day}T000000Z
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:💧 Time to Drink Water! (AquaDrop)
DESCRIPTION:Reminder #${count}: Take a glass of fresh water to reach your ${dailyGoalMl}ml daily goal.
BEGIN:VALARM
ACTION:AUDIO
TRIGGER:-PT0M
DESCRIPTION:💧 Drink Water Reminder
END:VALARM
END:VEVENT`);

    currentMin += intervalMinutes;
    count++;
  }

  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AquaDrop//iOS Water Drinking Reminder//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:AquaDrop Hydration Alarms
${events.join('\n')}
END:VCALENDAR`;

  // Create download link / blob
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'AquaDrop-Hydration-Alarms.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
