import Button from './Button';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-blob" />
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
