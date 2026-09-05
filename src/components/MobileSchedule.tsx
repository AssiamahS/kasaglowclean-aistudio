// Mobile "Schedule" view for the admin calendar.
// Mimics Google Calendar's mobile layout: sticky day headers, colored
// service strip, time range, customer & notes. Tap an event to edit it.

import React, { useMemo } from 'react';

export interface ScheduleEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  clientName?: string;
  service?: string;
}

interface Props {
  events: ScheduleEvent[];
  onSelectEvent: (ev: ScheduleEvent) => void;
}

const SERVICE_COLORS: Record<string, string> = {
  'Residential Cleaning': 'bg-blue-500',
  'Deep Cleaning': 'bg-purple-500',
  'Move In/Out Cleaning': 'bg-emerald-500',
  'Move-In / Move-Out Cleaning': 'bg-emerald-500',
  'Commercial Cleaning': 'bg-amber-500',
  'Office Cleaning': 'bg-amber-500',
};

const defaultColor = 'bg-gray-400';

function colorForService(service?: string) {
  if (!service) return defaultColor;
  return SERVICE_COLORS[service] || defaultColor;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function dayLabel(d: Date) {
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  if (sameDay(d, today)) return { label: 'Today', highlight: true };
  if (sameDay(d, tomorrow)) return { label: 'Tomorrow', highlight: true };
  return {
    label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    highlight: false
  };
}

const MobileSchedule: React.FC<Props> = ({ events, onSelectEvent }) => {
  const grouped = useMemo(() => {
    const sorted = [...events]
      .filter((e) => !Number.isNaN(e.start.getTime()))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    const map = new Map<string, ScheduleEvent[]>();
    for (const e of sorted) {
      const key = e.start.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries());
  }, [events]);

  if (grouped.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        No appointments scheduled.
        <div className="text-xs mt-1">Pull to refresh or tap Reload above.</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 bg-white">
      {grouped.map(([dayKey, list]) => {
        const d = new Date(dayKey);
        const { label, highlight } = dayLabel(d);
        return (
          <section key={dayKey}>
            <header className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-baseline justify-between">
              <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-gray-900'}`}>
                {label}
              </span>
              <span className="text-xs text-gray-500">
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </header>
            <ul className="divide-y divide-gray-100">
              {list.map((ev) => {
                const color = colorForService(ev.service || ev.title);
                return (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(ev)}
                      className="w-full flex items-stretch gap-3 px-4 py-3 text-left active:bg-gray-50"
                    >
                      <span className={`w-1 rounded-full flex-shrink-0 ${color}`} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-gray-900 truncate">
                          {ev.clientName ? `${ev.clientName}` : 'Appointment'}
                        </span>
                        <span className="block text-xs text-gray-600 truncate">
                          {ev.service || ev.title}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {fmtTime(ev.start)} – {fmtTime(ev.end)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default MobileSchedule;
