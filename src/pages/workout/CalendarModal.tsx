import { useState } from 'react';
import { WorkoutLogs, toISODate } from '../../storage/workoutLogs';

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                     'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAY_LABELS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

interface Props {
  logs: WorkoutLogs;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export default function CalendarModal({ logs, onSelect, onClose }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based

  const todayISO = toISODate(today);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // Build grid: find Monday of the week containing the 1st of the month
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Pad before and after to fill complete weeks
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function cellISO(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div className="cal-backdrop" onClick={onClose}>
      <div className="cal-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cal-header">
          <button className="cal-nav" onClick={prevMonth}>‹</button>
          <span className="cal-month-label">{MONTH_NAMES[month]} {year}</span>
          <button className="cal-nav" onClick={nextMonth}>›</button>
        </div>

        {/* Day labels */}
        <div className="cal-grid">
          {DAY_LABELS.map(d => (
            <div key={d} className="cal-day-label">{d}</div>
          ))}

          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const iso = cellISO(day);
            const isToday = iso === todayISO;
            const hasLog = !!logs[iso]?.exercises?.length;
            const isFuture = iso > todayISO;

            return (
              <button
                key={iso}
                className={`cal-cell ${isToday ? 'cal-cell--today' : ''} ${isFuture ? 'cal-cell--future' : ''}`}
                onClick={() => !isFuture && (onSelect(iso), onClose())}
                disabled={isFuture}
              >
                {day}
                {hasLog && <span className="cal-dot" />}
              </button>
            );
          })}
        </div>

        <button className="cal-close" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
