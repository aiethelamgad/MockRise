import { motion } from "framer-motion";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, XCircle, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useInterviewerStatusNotifications } from "@/hooks/useInterviewerStatusNotifications";
import { useAuth } from "@/contexts/AuthContext";

export default function RejectedNotice() {
  useInterviewerStatusNotifications();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleApplyAgain = async () => {
    // Clear the rejection notice flag so they can see it again if rejected
    sessionStorage.removeItem('has-seen-rejection');
    // Logout the rejected user so they can sign up fresh
    await logout();
    // Navigate to signup page
    navigate("/login?signup=true&role=interviewer");
  };

  const handleBackToHome = async () => {
    // Mark that user has seen the rejection notice
    sessionStorage.setItem('has-seen-rejection', 'true');
    // Logout the rejected user when they go back to home
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
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Application Not Approved</h1>
            <p className="text-muted-foreground">
              We appreciate your interest in becoming an interviewer. Unfortunately, we cannot approve your application at this time.
            </p>
            
            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Common reasons for rejection include:</p>
                <ul className="text-left space-y-1">
                  <li>• Insufficient experience in the field</li>
                  <li>• Incomplete application information</li>
                  <li>• Current capacity limitations</li>
                </ul>
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
                onClick={handleApplyAgain}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply Again
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
