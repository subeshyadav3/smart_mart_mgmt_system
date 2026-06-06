import Button from '../ui/Button';
import { Link } from 'react-router-dom';

export default function GuardedMessage({ title, description, actionLabel = 'Back to dashboard', actionTo = '/app/dashboard' }) {
  return (
    <div className="guard-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <Button as={Link} to={actionTo}>
        {actionLabel}
      </Button>
    </div>
  );
}
