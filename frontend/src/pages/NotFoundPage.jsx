import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="center-screen">
      <div className="guard-card">
        <h2>Page not found</h2>
        <p>The requested route does not exist in this workspace.</p>
        <Button as={Link} to="/app/dashboard">
          Return to dashboard
        </Button>
      </div>
    </div>
  );
}
