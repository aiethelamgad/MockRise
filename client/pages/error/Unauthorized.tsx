// src/pages/Unauthorized.tsx
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine where to redirect based on user's role
  const handleBackToSafety = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    switch (user.role) {
      case 'admin':
      case 'super_admin':
      case 'hr_admin':
        navigate('/admin');
        break;
      case 'interviewer':
        navigate('/interviewer');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <Shield className="h-24 w-24 text-destructive opacity-80" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        
        <p className="text-muted-foreground text-lg">
          Sorry, you don't have permission to access this page. 
          Please contact your administrator if you believe this is a mistake.
        </p>

        <div className="pt-4">
          <Button 
            onClick={handleBackToSafety}
            className="gap-2"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Safety
          </Button>
        </div>
      </div>
    </div>
  );
}