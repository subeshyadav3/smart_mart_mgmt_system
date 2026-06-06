export default function StatCard({ label, value, hint, tone = 'blue', icon }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-card-icon">{icon}</div>
      <div>
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
        {hint ? <p className="stat-card-hint">{hint}</p> : null}
      </div>
    </article>
  );
}
