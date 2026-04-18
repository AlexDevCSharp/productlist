import { useState, useEffect } from 'react';
import workoutData from '../data/workout.json';
import {
  loadLogs, saveExerciseLog, deleteExerciseLog,
  WorkoutLogs, ExerciseLog, SetLog,
  todayISO, dateToWeekIndex, toISODate,
} from '../storage/workoutLogs';
import CalendarModal from './workout/CalendarModal';
import WeekStrip from './workout/WeekStrip';

const program = workoutData.program;
const days = program.days;

const DAY_ICONS: Record<string, string> = {
  'Ноги + Плечи': '🦵',
  'Спина + Бицепс': '💪',
  'Грудь + Трицепс': '🏋️',
  'Кардио': '🏃',
  'Отдых': '😴',
};

const MONTH_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const DAY_FULL = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return `${DAY_FULL[dateToWeekIndex(iso)]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

type View =
  | { screen: 'week' }
  | { screen: 'day'; date: string }
  | { screen: 'exercise'; date: string; exIdx: number };

export default function WorkoutPage() {
  const [view, setView] = useState<View>({ screen: 'week' });
  const [logs, setLogs] = useState<WorkoutLogs>(loadLogs);
  const [showCalendar, setShowCalendar] = useState(false);

  function refreshLogs() { setLogs(loadLogs()); }

  if (view.screen === 'week') {
    return (
      <>
        <WeekView
          logs={logs}
          onSelectDay={date => setView({ screen: 'day', date })}
          onOpenCalendar={() => setShowCalendar(true)}
        />
        {showCalendar && (
          <CalendarModal
            logs={logs}
            onSelect={date => { setShowCalendar(false); setView({ screen: 'day', date }); }}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </>
    );
  }

  if (view.screen === 'day') {
    return (
      <DayView
        date={view.date}
        logs={logs}
        onBack={() => setView({ screen: 'week' })}
        onSelectExercise={i => setView({ screen: 'exercise', date: view.date, exIdx: i })}
      />
    );
  }

  return (
    <ExerciseView
      date={view.date}
      exIdx={view.exIdx}
      logs={logs}
      onLogsChange={setLogs}
      onBack={() => setView({ screen: 'day', date: view.date })}
    />
  );
}

/* ── Week View ── */

function WeekView({ logs, onSelectDay, onOpenCalendar }: {
  logs: WorkoutLogs;
  onSelectDay: (date: string) => void;
  onOpenCalendar: () => void;
}) {
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);

  // When user picks from strip, update the visible week and navigate to that day
  function handleStripSelect(date: string) {
    setSelectedDate(date);
    onSelectDay(date);
  }

  // Build current week card list based on selectedDate's week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const monday = new Date(selectedDate + 'T12:00:00');
    monday.setDate(monday.getDate() - dateToWeekIndex(selectedDate) + i);
    return toISODate(monday);
  });

  return (
    <div className="page">
      <div className="workout-header">
        <div className="workout-header-top">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="workout-header-icon">💪</div>
            <h1>Тренировки</h1>
            <p className="workout-subtitle">{program.name}</p>
          </div>
          <button className="cal-icon-btn" onClick={onOpenCalendar} title="Открыть календарь">
            📅
          </button>
        </div>
        <WeekStrip selectedDate={selectedDate} logs={logs} onSelect={handleStripSelect} />
      </div>

      <div className="week-list">
        {weekDates.map((date) => {
          const dayIdx = dateToWeekIndex(date);
          const day = days[dayIdx];
          const isToday = date === today;
          const isFuture = date > today;
          const isRest = day.focus === 'Отдых';
          const isCardio = day.focus === 'Кардио';
          const icon = DAY_ICONS[day.focus] ?? '🏋️';
          const dayLog = logs[date];
          const loggedCount = dayLog?.exercises?.length ?? 0;
          const exCount = day.exercises?.length ?? 0;
          const d = new Date(date + 'T12:00:00');
          const dateLabel = `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;

          return (
            <button
              key={date}
              className={`day-card ${isToday ? 'day-card--today' : ''} ${isRest || isFuture ? 'day-card--rest' : ''}`}
              onClick={() => !isRest && !isFuture && onSelectDay(date)}
              disabled={isRest || isFuture}
            >
              <div className="day-card-left">
                <span className="day-icon">{icon}</span>
                <div>
                  <div className="day-name">
                    {day.day}, {dateLabel}
                    {isToday && <span className="today-badge">сегодня</span>}
                  </div>
                  <div className="day-focus">{day.focus}</div>
                </div>
              </div>
              <div className="day-card-right">
                {isRest ? (
                  <span className="day-meta">отдых</span>
                ) : isCardio ? (
                  <span className="day-meta">40 мин</span>
                ) : loggedCount > 0 ? (
                  <span className="day-meta day-meta--logged">✓ {loggedCount}/{exCount}</span>
                ) : (
                  <span className="day-meta">{exCount} упр.</span>
                )}
                {!isRest && !isFuture && <span className="day-chevron">›</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Day View ── */

function DayView({ date, logs, onBack, onSelectExercise }: {
  date: string;
  logs: WorkoutLogs;
  onBack: () => void;
  onSelectExercise: (i: number) => void;
}) {
  const dayIdx = dateToWeekIndex(date);
  const day = days[dayIdx];
  const warmup = (day as any).warmup;
  const cooldown = (day as any).cooldown;
  const isCardio = day.focus === 'Кардио';
  const dayLog = logs[date];

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>‹ Назад</button>
      </div>

      <div className="day-header">
        <div className="day-header-icon">{DAY_ICONS[day.focus] ?? '🏋️'}</div>
        <h2>{formatDate(date)}</h2>
        <p className="day-focus-title">{day.focus}</p>
      </div>

      {warmup && (
        <Section title="Разминка">
          <div className="warmup-card">
            <img src={warmup.image_url} alt={warmup.exercise} className="exercise-gif-small" />
            <div>
              <div className="warmup-name">{warmup.exercise}</div>
              <div className="warmup-meta">{warmup.duration_min} мин · {warmup.notes}</div>
            </div>
          </div>
        </Section>
      )}

      {isCardio ? (
        <Section title="Кардио">
          {day.exercises.map((ex: any) => (
            <div key={ex.id} className="cardio-card">
              <img src={ex.image_url} alt={ex.name} className="exercise-gif-small" />
              <div>
                <div className="cardio-name">{ex.name} — {ex.equipment}</div>
                <div className="cardio-meta">{ex.duration_min} мин · {ex.notes}</div>
              </div>
            </div>
          ))}
        </Section>
      ) : (
        <Section title="Упражнения">
          {day.exercises.map((ex: any, i: number) => {
            const exLog = dayLog?.exercises?.find(e => e.exerciseId === ex.id);
            const setCount = exLog?.sets?.length ?? 0;
            const lastSet = exLog?.sets?.[setCount - 1];
            return (
              <button key={ex.id} className="exercise-row" onClick={() => onSelectExercise(i)}>
                <div className="exercise-row-num">{ex.id}</div>
                <img src={ex.image_url} alt={ex.name} className="exercise-gif-tiny" />
                <div className="exercise-row-info">
                  <div className="exercise-row-name">{ex.name}</div>
                  <div className="exercise-row-meta">{ex.sets} × {ex.reps}</div>
                  {setCount > 0 ? (
                    <div className="exercise-row-log">
                      ✓ {setCount} подх. · последний: {lastSet!.weight} кг × {lastSet!.reps}
                    </div>
                  ) : (
                    <div className="exercise-row-muscles">{(ex.muscles as string[]).join(', ')}</div>
                  )}
                </div>
                <span className="day-chevron">›</span>
              </button>
            );
          })}
        </Section>
      )}

      {cooldown && (
        <Section title={`Заминка · ${cooldown.duration_min} мин`}>
          {cooldown.stretches.map((s: any) => (
            <div key={s.name} className="stretch-card">
              <img src={s.image_url} alt={s.name} className="exercise-gif-small" />
              <div>
                <div className="stretch-name">{s.name}</div>
                <div className="stretch-tech">{s.technique}</div>
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

/* ── Exercise View ── */

function ExerciseView({ date, exIdx, logs, onLogsChange, onBack }: {
  date: string;
  exIdx: number;
  logs: WorkoutLogs;
  onLogsChange: (logs: WorkoutLogs) => void;
  onBack: () => void;
}) {
  const dayIdx = dateToWeekIndex(date);
  const day = days[dayIdx];
  const ex = (day as any).exercises[exIdx];
  const isPast = date < todayISO();

  const existingLog = logs[date]?.exercises?.find((e: ExerciseLog) => e.exerciseId === ex.id);
  const [sets, setSets] = useState<SetLog[]>(existingLog?.sets ?? []);
  const [readOnly, setReadOnly] = useState(isPast && !!existingLog?.sets?.length);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const existing = logs[date]?.exercises?.find((e: ExerciseLog) => e.exerciseId === ex.id);
    setSets(existing?.sets ?? []);
    setReadOnly(isPast && !!(existing?.sets?.length));
  }, [date, ex.id]);

  function addSet() {
    const last = sets[sets.length - 1];
    setSets(s => [...s, { weight: last?.weight ?? 0, reps: last?.reps ?? 0 }]);
  }

  function updateSet(i: number, field: keyof SetLog, val: number) {
    setSets(s => s.map((set, idx) => idx === i ? { ...set, [field]: val } : set));
  }

  function removeSet(i: number) {
    setSets(s => s.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    const log: ExerciseLog = { exerciseId: ex.id, exerciseName: ex.name, sets };
    const updated = saveExerciseLog(date, dayIdx, day.focus, log);
    onLogsChange(updated);
    if (isPast) setReadOnly(true);
    showToast('Сохранено ✓');
  }

  function handleDelete() {
    const updated = deleteExerciseLog(date, ex.id);
    onLogsChange(updated);
    setSets([]);
    setReadOnly(false);
    showToast('Удалено');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>‹ Назад</button>
      </div>

      <div className="ex-detail-header">
        <h2 className="ex-detail-name">{ex.name}</h2>
        <div className="ex-badges">
          <span className="badge badge--sets">{ex.sets} подхода</span>
          <span className="badge badge--reps">{ex.reps} повт.</span>
          {ex.weight_start_kg && <span className="badge badge--weight">с {ex.weight_start_kg} кг</span>}
        </div>
      </div>

      <div className="ex-gif-wrap">
        <img src={ex.image_url} alt={ex.name} className="ex-gif-main" />
      </div>

      <div className="ex-muscles">
        {(ex.muscles as string[]).map((m: string) => (
          <span key={m} className="muscle-tag">{m}</span>
        ))}
      </div>

      {ex.equipment && <InfoCard icon="🏋️" label="Оборудование" text={ex.equipment} />}
      {ex.replaced && <InfoCard icon="🔄" label={`Заменено: ${ex.original}`} text={ex.replace_reason} accent />}

      <Section title="Техника">
        <ol className="technique-list">
          {(ex.technique as string[]).map((step: string, i: number) => (
            <li key={i} className="technique-item">
              <span className="technique-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {ex.common_mistakes?.length > 0 && (
        <Section title="Частые ошибки">
          {(ex.common_mistakes as string[]).map((m: string, i: number) => (
            <div key={i} className="mistake-item">⚠️ {m}</div>
          ))}
        </Section>
      )}

      {ex.spine_note && <div className="spine-note">🦴 {ex.spine_note}</div>}

      {ex.alternative && (
        <Section title="Альтернатива">
          <div className="alt-card">
            {ex.alternative.image_url && (
              <img src={ex.alternative.image_url} alt={ex.alternative.name} className="exercise-gif-small" />
            )}
            <div>
              <div className="alt-name">{ex.alternative.name}</div>
              <div className="alt-notes">{ex.alternative.notes}</div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Set logging section ── */}
      <div className="sets-section">
        <div className="section-title">Мои подходы</div>

        {sets.length === 0 && !readOnly && (
          <p className="sets-empty">Нажмите «+ Добавить подход» чтобы начать</p>
        )}

        {sets.map((set, i) => (
          <div key={i} className="set-row">
            <span className="set-num">{i + 1}</span>
            <div className="set-field">
              <input
                type="number"
                className="set-input"
                value={set.weight || ''}
                min={0}
                placeholder="0"
                readOnly={readOnly}
                onChange={e => updateSet(i, 'weight', parseFloat(e.target.value) || 0)}
              />
              <span className="set-unit">кг</span>
            </div>
            <span className="set-sep">×</span>
            <div className="set-field">
              <input
                type="number"
                className="set-input"
                value={set.reps || ''}
                min={0}
                placeholder="0"
                readOnly={readOnly}
                onChange={e => updateSet(i, 'reps', parseInt(e.target.value) || 0)}
              />
              <span className="set-unit">раз</span>
            </div>
            {!readOnly && (
              <button className="set-delete" onClick={() => removeSet(i)}>🗑</button>
            )}
          </div>
        ))}

        {!readOnly && (
          <button className="sets-add-btn" onClick={addSet}>+ Добавить подход</button>
        )}

        <div className="sets-actions">
          {readOnly ? (
            <button className="sets-save-btn sets-save-btn--edit" onClick={() => setReadOnly(false)}>
              Изменить
            </button>
          ) : (
            <button
              className="sets-save-btn"
              onClick={handleSave}
              disabled={sets.length === 0}
            >
              Сохранить
            </button>
          )}
          {sets.length > 0 && readOnly && (
            <button className="sets-delete-btn" onClick={handleDelete}>Удалить запись</button>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── Helpers ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="section-title">{title}</div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function InfoCard({ icon, label, text, accent }: { icon: string; label: string; text: string; accent?: boolean }) {
  return (
    <div className={`info-card ${accent ? 'info-card--accent' : ''}`}>
      <span className="info-card-icon">{icon}</span>
      <div>
        <div className="info-card-label">{label}</div>
        <div className="info-card-text">{text}</div>
      </div>
    </div>
  );
}
