import React, { useMemo } from "react";

const DEFAULT_SLOTS = ["07:30", "09:30", "13:30", "15:50", "17:30", "19:30"];
const SLOT_INTERVAL_MINUTES = 30;
const START_TIME = 7 * 60; // 07:00 in minutes
const END_TIME = 22 * 60; // 22:00 in minutes

function getAllSlots() {
  const slots: string[] = [];
  for (let min = START_TIME; min <= END_TIME; min += SLOT_INTERVAL_MINUTES) {
    const h = Math.floor(min / 60)
    const m = min % 60
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
  }
  return slots;
}

function getVisibleSlots(events: { time: string }[]) {
  const eventSlots = events.map(e => e.time);
  return Array.from(new Set([...DEFAULT_SLOTS, ...eventSlots])).sort();
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minutes);
  return date.toTimeString().slice(0,5);
}

export interface DayViewEvent {
  time: string; // "HH:mm"
  note?: string;
  type?: "log" | "responsibility";
}

interface DayViewCalendarProps {
  date: Date;
  events: DayViewEvent[];
  onAddEvent: (time: string) => void;
  onDateChange: (date: Date) => void;
}

const typeColor: Record<string, string> = {
  log: "bg-blue-500",
  responsibility: "bg-green-500",
};

const DayViewCalendar: React.FC<DayViewCalendarProps> = ({ date, events, onAddEvent, onDateChange }) => {
  const visibleSlots = useMemo(() => getVisibleSlots(events), [events]);

  const handlePrevDay = () => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 1);
    onDateChange(prev);
  };
  const handleNextDay = () => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    onDateChange(next);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevDay} className="text-blue-600 dark:text-blue-400 hover:underline px-2 py-1">◀</button>
        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">{date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        <button onClick={handleNextDay} className="text-blue-600 dark:text-blue-400 hover:underline px-2 py-1">▶</button>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {visibleSlots.map((slot) => {
          const event = events.find(e => e.time === slot);
          return (
            <div key={slot} className="flex items-center py-3 group">
              <div className="w-16 text-right pr-4 text-gray-800 dark:text-gray-300 font-mono">{slot}</div>
              {event ? (
                <div className="flex-1 flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${typeColor[event.type ?? "log"]}`} />
                  <span className="text-gray-900 dark:text-gray-100">{event.note || (event.type === "responsibility" ? "Responsabilidade" : "Log diário")}</span>
                </div>
              ) : (
                <button
                  className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline opacity-0 group-hover:opacity-100 transition"
                  onClick={() => onAddEvent(slot)}
                  title="Adicionar evento neste horário"
                >
                  + Adicionar evento
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayViewCalendar; 