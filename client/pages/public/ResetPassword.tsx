import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthBackground } from "@/components/auth/auth-background";
import { GlassCard } from "@/components/ui/glass-card";
import { authService } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Password validation state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        setIsTokenValid(false);
        toast.error("Invalid reset link. Please request a new password reset.");
        return;
      }

      try {
        const response = await authService.validateResetToken(token);
        if (response.success) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          toast.error("Invalid or expired reset token. Please request a new password reset link.");
        }
      } catch (error: any) {
        // Error handling done via toast notifications
        setIsTokenValid(false);
        toast.error(error.message || "Invalid or expired reset token. Please request a new password reset link.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Password validation function
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!password) {
      setErrors({ password: "Password is required." });
      return;
    }

    if (!validatePassword(password)) {
      setErrors({ password: "Password does not meet all requirements." });
      return;
    }

    if (!confirmPassword) {
      setErrors({ confirmPassword: "Please confirm your password." });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset link.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        setIsResetSuccess(true);
        toast.success("Password reset successfully! Redirecting to login...");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login", { replace: true, state: { passwordResetSuccess: true } });
        }, 2000);
      }
    } catch (error: any) {
      // Error handling done via toast notifications
      toast.error(error.message || "Failed to reset password. Please try again.");
      setErrors({ submit: error.message || "Failed to reset password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidating) {
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
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Validating reset token...</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </AuthBackground>
    );
  }

  // Invalid token state
  if (!isTokenValid || !token) {
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
              <Link to="/" className="flex items-center justify-center space-x-2 mb-6 group focus:outline-none">
                <Sparkles className="h-8 w-8 text-primary transition-all duration-300 group-hover:rotate-12" />
                <span className="text-2xl font-bold gradient-text">MockRise</span>
              </Link>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="mx-auto mb-4 w-16 h-16 bg-destructive/12 rounded-full flex items-center justify-center"
                  aria-hidden
                >
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </motion.div>

                <h2 className="text-2xl font-semibold mb-2">Invalid Reset Link</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  This password reset link is invalid or has expired. Please request a new password reset link.
                </p>

                <div className="space-y-3">
                  <Link to="/forgot-password">
                    <EnhancedButton className="w-full">
                      Request New Reset Link
                    </EnhancedButton>
                  </Link>

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

  // Success state
  if (isResetSuccess) {
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
              <Link to="/" className="flex items-center justify-center space-x-2 mb-6 group focus:outline-none">
                <Sparkles className="h-8 w-8 text-primary transition-all duration-300 group-hover:rotate-12" />
                <span className="text-2xl font-bold gradient-text">MockRise</span>
              </Link>

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

                <h2 className="text-2xl font-semibold mb-2">Password Reset Successful</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>

                <Link to="/login">
                  <EnhancedButton className="w-full">
                    Go to Login
                  </EnhancedButton>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </AuthBackground>
    );
  }

  // Reset password form
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
              <h1 className="text-2xl font-semibold mb-1">Reset Your Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your new password below.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    required
                    aria-required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                
                {/* Password Requirements */}
                {password && (
                  <div className="text-xs space-y-1 mt-2 p-3 bg-muted/50 rounded-md">
                    <p className="font-medium mb-2">Password must contain:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordRequirements.length ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordRequirements.uppercase ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>Uppercase</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.lowercase ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordRequirements.lowercase ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>Lowercase</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordRequirements.number ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.special ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordRequirements.special ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>Special char</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    required
                    aria-required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              {errors.submit && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.submit}
                </div>
              )}

              <EnhancedButton
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-95 transition-opacity"
                loading={isLoading}
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
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

