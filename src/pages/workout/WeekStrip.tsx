import { WorkoutLogs, todayISO, getWeekDates } from '../../storage/workoutLogs';

const DAY_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

interface Props {
  selectedDate: string;
  logs: WorkoutLogs;
  onSelect: (date: string) => void;
}

export default function WeekStrip({ selectedDate, logs, onSelect }: Props) {
  const today = todayISO();
  const weekDates = getWeekDates(selectedDate);

  return (
    <div className="week-strip">
      {weekDates.map((date, i) => {
        const day = parseInt(date.slice(8), 10);
        const isToday = date === today;
        const isSelected = date === selectedDate;
        const hasLog = !!logs[date]?.exercises?.length;
        const isFuture = date > today;

        return (
          <button
            key={date}
            className={`ws-day ${isSelected ? 'ws-day--selected' : ''} ${isToday ? 'ws-day--today' : ''} ${isFuture ? 'ws-day--future' : ''}`}
            onClick={() => !isFuture && onSelect(date)}
            disabled={isFuture}
          >
            <span className="ws-label">{DAY_SHORT[i]}</span>
            <span className="ws-num">{day}</span>
            {hasLog && <span className="ws-dot" />}
          </button>
        );
      })}
    </div>
  );
}
