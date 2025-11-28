import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthBackground } from "@/components/auth/auth-background";
import { GlassCard } from "@/components/ui/glass-card";
import { authService } from "@/services/auth.service";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setApiError(null);
    
    // Validate email format
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    // Debug: Log the email being sent
    console.log('[ForgotPassword] Submitting email:', email);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setIsEmailSent(true);
        setResendCooldown(60); // 60 second cooldown for resend
        toast.success(response.message || "A password reset link has been sent to your email.");
      } else {
        // Handle OAuth account error
        if (response.error === 'oauth_account') {
          setApiError(response.message || "This email is associated with an OAuth account. Please sign in using your OAuth provider.");
          toast.error(response.message || "This email is associated with an OAuth account. Please sign in using your OAuth provider.");
        } else {
          setApiError(response.message || "An error occurred. Please try again.");
          toast.error(response.message || "An error occurred. Please try again.");
        }
      }
    } catch (error: any) {
      // Error handling done via toast notifications
      
      // Check if error has response data (from API client)
      const responseData = error.responseData || {};
      
      // Extract error message with priority: responseData.message > responseData.error > error.message
      let errorMessage = responseData.message || responseData.error || error.message || "An error occurred. Please try again.";
      
      // Log error for debugging (stringify to see full object)
      console.error('[ForgotPassword] Error details:', JSON.stringify({
        statusCode: error.statusCode,
        responseData,
        errorMessage: error.message,
        fullError: error,
      }, null, 2));
      
      // Handle OAuth account error
      if (responseData.error === 'oauth_account' || errorMessage.toLowerCase().includes('oauth') || errorMessage.toLowerCase().includes('google') || errorMessage.toLowerCase().includes('github')) {
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else if (error.statusCode === 400) {
        // Handle 400 errors (validation errors, OAuth accounts, etc.)
        // If no specific message, use a generic one
        if (!errorMessage || errorMessage === 'An error occurred. Please try again.') {
          errorMessage = responseData.error || 'Invalid request. Please check your email and try again.';
        }
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else if (error.statusCode === 500) {
        // Handle server errors
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else {
        // For unknown errors, show generic message but don't set email sent
        setApiError("Failed to send password reset email. Please try again.");
        toast.error("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) {
      toast.info(`Please wait ${resendCooldown}s before resending.`);
      return;
    }
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    setApiError(null); // Clear previous errors
    
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setResendCooldown(60); // 60 second cooldown
        toast.success(response.message || "A password reset link has been sent to your email.");
        setApiError(null); // Clear any previous errors
      } else {
        if (response.error === 'oauth_account') {
          setApiError(response.message || "This email is associated with an OAuth account. Please sign in using your OAuth provider.");
          toast.error(response.message || "This email is associated with an OAuth account. Please sign in using your OAuth provider.");
        } else {
          setApiError(response.message || "An error occurred. Please try again.");
          toast.error(response.message || "An error occurred. Please try again.");
        }
      }
    } catch (error: any) {
      // Error handling done via toast notifications
      
      // Check if error has response data (from API client)
      const responseData = error.responseData || {};
      
      // Extract error message with priority: responseData.message > responseData.error > error.message
      let errorMessage = responseData.message || responseData.error || error.message || "An error occurred. Please try again.";
      
      // Log error for debugging
      console.error('[ForgotPassword] Resend error:', JSON.stringify({
        statusCode: error.statusCode,
        responseData,
        errorMessage: error.message,
      }, null, 2));
      
      // Handle OAuth account error
      if (responseData.error === 'oauth_account' || errorMessage.toLowerCase().includes('oauth') || errorMessage.toLowerCase().includes('google') || errorMessage.toLowerCase().includes('github')) {
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else {
        setApiError("Failed to send password reset email. Please try again.");
        toast.error("Failed to send password reset email. Please try again.");
      }
    }
  };

  // SUCCESS STATE
  if (isEmailSent) {
    return (
      <AuthBackground variant="forgot">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md relative z-10"
          >
            <GlassCard>
              {/* Logo */}
              <Link to="/" className="flex items-center justify-center space-x-2 mb-6 group focus:outline-none">
                <Sparkles className="h-8 w-8 text-primary transition-all duration-300 group-hover:rotate-12" />
                <span className="text-2xl font-bold gradient-text">MockRise</span>
              </Link>

              {/* Success */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.12 }}
                  className="mx-auto mb-4 w-16 h-16 bg-success/12 rounded-full flex items-center justify-center shadow-sm"
                  aria-hidden
                >
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </motion.div>

                <h2 className="text-2xl font-semibold mb-2">Check Your Email</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email || "your email"}</strong>. Check your inbox and follow the
                  instructions to reset your password.
                </p>

                <div className="space-y-3">
                  <EnhancedButton
                    variant="outline"
                    onClick={handleResendEmail}
                    className="w-full"
                    disabled={resendCooldown > 0}
                    aria-disabled={resendCooldown > 0}
                    aria-live="polite"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Email"}
                  </EnhancedButton>

                  <Link to="/login">
                    <EnhancedButton variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </EnhancedButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </AuthBackground>
    );
  }

  // FORM STATE
  return (
    <AuthBackground variant="forgot">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md relative z-10"
        >
          <GlassCard>
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6 group focus:outline-none">
              <Sparkles className="h-8 w-8 text-primary transition-all duration-300 group-hover:rotate-12" />
              <span className="text-2xl font-bold gradient-text">MockRise</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-semibold mb-1">Forgot Password?</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="forgot-desc">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setApiError(null); // Clear error when user types
                    }}
                    required
                    aria-required
                    aria-label="Email address"
                    autoComplete="email"
                  />
                </div>
                {apiError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    <p>{apiError}</p>
                  </div>
                )}
              </div>

              <EnhancedButton
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-95 transition-opacity"
                loading={isLoading}
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </EnhancedButton>
            </form>

            <div className="mt-4">
              <Separator />
            </div>

            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AuthBackground>
  );
}
