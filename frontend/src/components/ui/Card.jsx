export default function Card({ className = '', children }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div className="card-header">
      <div>
        {title ? <h2 className="card-title">{title}</h2> : null}
        {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="card-actions">{actions}</div> : null}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`card-body ${className}`.trim()}>{children}</div>;
}
