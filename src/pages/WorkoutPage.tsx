import { useState } from 'react';
import workoutData from '../data/workout.json';

const program = workoutData.program;
const days = program.days;

// JS getDay(): 0=Sun → index 6, 1=Mon → 0, etc.
const todayIndex = (new Date().getDay() + 6) % 7;

const DAY_ICONS: Record<string, string> = {
  'Ноги + Плечи': '🦵',
  'Спина + Бицепс': '💪',
  'Грудь + Трицепс': '🏋️',
  'Кардио': '🏃',
  'Отдых': '😴',
};

type View = { screen: 'week' } | { screen: 'day'; dayIdx: number } | { screen: 'exercise'; dayIdx: number; exIdx: number };

export default function WorkoutPage() {
  const [view, setView] = useState<View>({ screen: 'week' });

  if (view.screen === 'week') {
    return <WeekView onSelectDay={i => setView({ screen: 'day', dayIdx: i })} />;
  }
  if (view.screen === 'day') {
    return (
      <DayView
        dayIdx={view.dayIdx}
        onBack={() => setView({ screen: 'week' })}
        onSelectExercise={i => setView({ screen: 'exercise', dayIdx: view.dayIdx, exIdx: i })}
      />
    );
  }
  return (
    <ExerciseView
      dayIdx={view.dayIdx}
      exIdx={view.exIdx}
      onBack={() => setView({ screen: 'day', dayIdx: view.dayIdx })}
    />
  );
}

/* ── Week view ── */

function WeekView({ onSelectDay }: { onSelectDay: (i: number) => void }) {
  return (
    <div className="page">
      <div className="workout-header">
        <div className="workout-header-icon">💪</div>
        <h1>Тренировки</h1>
        <p className="workout-subtitle">{program.name} · {program.level === 'beginner' ? 'начальный уровень' : program.level}</p>
      </div>

      <div className="week-list">
        {days.map((day, i) => {
          const isToday = i === todayIndex;
          const isRest = day.focus === 'Отдых';
          const isCardio = day.focus === 'Кардио';
          const exCount = day.exercises?.length ?? 0;
          const icon = DAY_ICONS[day.focus] ?? '🏋️';

          return (
            <button
              key={day.day}
              className={`day-card ${isToday ? 'day-card--today' : ''} ${isRest ? 'day-card--rest' : ''}`}
              onClick={() => !isRest && onSelectDay(i)}
              disabled={isRest}
            >
              <div className="day-card-left">
                <span className="day-icon">{icon}</span>
                <div>
                  <div className="day-name">{day.day} {isToday && <span className="today-badge">сегодня</span>}</div>
                  <div className="day-focus">{day.focus}</div>
                </div>
              </div>
              <div className="day-card-right">
                {isRest ? (
                  <span className="day-meta">отдых</span>
                ) : isCardio ? (
                  <span className="day-meta">40 мин</span>
                ) : (
                  <span className="day-meta">{exCount} упр.</span>
                )}
                {!isRest && <span className="day-chevron">›</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Day view ── */

function DayView({ dayIdx, onBack, onSelectExercise }: {
  dayIdx: number;
  onBack: () => void;
  onSelectExercise: (i: number) => void;
}) {
  const day = days[dayIdx];
  const warmup = (day as any).warmup;
  const cooldown = (day as any).cooldown;
  const isCardio = day.focus === 'Кардио';

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>‹ Назад</button>
      </div>

      <div className="day-header">
        <div className="day-header-icon">{DAY_ICONS[day.focus] ?? '🏋️'}</div>
        <h2>{day.day}</h2>
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
          {day.exercises.map((ex: any, i: number) => (
            <button key={ex.id} className="exercise-row" onClick={() => onSelectExercise(i)}>
              <div className="exercise-row-num">{ex.id}</div>
              <img src={ex.image_url} alt={ex.name} className="exercise-gif-tiny" />
              <div className="exercise-row-info">
                <div className="exercise-row-name">{ex.name}</div>
                <div className="exercise-row-meta">
                  {ex.sets} × {ex.reps}
                  {ex.weight_start_kg && ` · ${ex.weight_start_kg} кг`}
                </div>
                <div className="exercise-row-muscles">{(ex.muscles as string[]).join(', ')}</div>
              </div>
              <span className="day-chevron">›</span>
            </button>
          ))}
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

/* ── Exercise view ── */

function ExerciseView({ dayIdx, exIdx, onBack }: {
  dayIdx: number;
  exIdx: number;
  onBack: () => void;
}) {
  const ex = (days[dayIdx] as any).exercises[exIdx];

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
          {ex.weight_start_kg && (
            <span className="badge badge--weight">с {ex.weight_start_kg} кг</span>
          )}
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

      {ex.equipment && (
        <InfoCard icon="🏋️" label="Оборудование" text={ex.equipment} />
      )}

      {ex.replaced && (
        <InfoCard icon="🔄" label={`Заменено: ${ex.original}`} text={ex.replace_reason} accent />
      )}

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

      {ex.spine_note && (
        <div className="spine-note">🦴 {ex.spine_note}</div>
      )}

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
