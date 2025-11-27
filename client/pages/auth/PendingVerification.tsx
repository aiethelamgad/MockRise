import { motion } from "framer-motion";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Clock, CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { useInterviewerStatusNotifications } from "@/hooks/useInterviewerStatusNotifications";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingVerification() {
  useInterviewerStatusNotifications();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleBackToHome = async () => {
    // Logout the pending user when they go back to home
    // This allows them to sign in normally from the landing page
    await logout();
    navigate("/");
  };
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <EnhancedCard className="p-8 glass" variant="glass">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8 group">
            <Sparkles className="h-8 w-8 text-primary transition-all duration-300 group-hover:rotate-12" />
            <span className="text-2xl font-bold gradient-text">MockRise</span>
          </Link>

          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="h-10 w-10 text-primary" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Application Under Review</h1>
            <p className="text-muted-foreground">
              Thank you for applying to become an interviewer! Your application is currently being reviewed by our team.
            </p>
            
            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Application submitted successfully</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-warning" />
                <span>Under review (typically 2-3 business days)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>You'll receive an email notification once reviewed</span>
              </div>
            </div>

            <div className="space-y-3">
              <EnhancedButton
                onClick={() => window.location.href = "mailto:support@mockrise.com"}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </EnhancedButton>
              
              <EnhancedButton 
                onClick={handleBackToHome}
                variant="ghost" 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </EnhancedButton>
            </div>
          </div>
        </EnhancedCard>
      </motion.div>
    </div>
  );
}
