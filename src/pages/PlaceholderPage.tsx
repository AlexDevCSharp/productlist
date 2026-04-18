interface PlaceholderPageProps {
  icon: string;
  label: string;
}

export default function PlaceholderPage({ icon, label }: PlaceholderPageProps) {
  return (
    <div className="page placeholder-page">
      <div className="placeholder-content">
        <div className="placeholder-icon">{icon}</div>
        <h2>{label}</h2>
        <p>Скоро здесь появится новый раздел</p>
      </div>
    </div>
  );
}
