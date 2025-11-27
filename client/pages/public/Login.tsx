import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Mail, Lock, User, Github, Eye, EyeOff, Briefcase, Linkedin, Upload, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Section3D } from "@/components/3D/Section3D";
import { GlassCard } from "@/components/ui/glass-card";
import { AuthBackground } from "@/components/auth/auth-background";
import { authService } from "@/services/auth.service";
import { SKILL_TREE } from "@/config/skillTree";
import { ROUTES } from "@/routes/routes.config";
import { getDashboardPath } from "@/utils/routing";

export default function Login() {
  const { login, register, user, loading, logout, fetchUser } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = searchParams.get("signup") === "true";
  const roleParam = searchParams.get("role");
  const [isSignupMode, setIsSignupMode] = useState(isSignup);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState(roleParam || "trainee");

  // If role parameter is provided and signup mode, ensure signup mode is enabled
  useEffect(() => {
    if (roleParam && roleParam === "interviewer") {
      setIsSignupMode(true);
      setUserRole("interviewer");
    }
  }, [roleParam]);
  const [yearsExperience, setYearsExperience] = useState("");
  const [expertiseArea, setExpertiseArea] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password validation state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Handle OAuth errors from query parameters
  useEffect(() => {
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    
    if (error === 'oauth_failed' || error === 'oauth_invalid_role') {
      const message = errorMessage || 'OAuth authentication failed. Please try again.';
      toast.error(message);
      // Clear the error parameters from URL
      navigate(`${ROUTES.LOGIN}?signup=${isSignupMode ? 'true' : 'false'}`, { replace: true });
    }
  }, [searchParams, navigate, isSignupMode]);

  // Handle password reset success message
  useEffect(() => {
    const passwordResetSuccess = (window.history.state as any)?.passwordResetSuccess || 
                                  searchParams.get('passwordResetSuccess') === 'true';
    if (passwordResetSuccess) {
      toast.success("Password reset successful! Please log in with your new password.");
      // Clear the parameter
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch user data on mount to check if already logged in (only on login page)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if user is already logged in when component mounts
  useEffect(() => {
    if (user && !loading) {
      // Rejected interviewers should always go to rejected notice
      if (user.role === 'interviewer' && user.status === 'rejected') {
        navigate(ROUTES.REJECTED_NOTICE, { replace: true });
        return;
      }
      // Pending interviewers should go to pending verification
      if (user.role === 'interviewer' && user.status === 'pending_verification') {
        navigate(ROUTES.PENDING_VERIFICATION, { replace: true });
        return;
      }
      // Skip redirect for rejected users trying to re-apply (they should stay on signup)
      if (user.status === 'rejected' && isSignup) {
        return;
      }
      // Otherwise, redirect to appropriate dashboard
      if (!isSignupMode) {
        const dashboardPath = getDashboardPath(user.role);
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [user, navigate, loading, isSignupMode, isSignup, location.state]);

  // Password validation function
  const validatePassword = (password: string) => {
    setApiError(null);
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

  // Validation function
  const validateForm = () => {
    setApiError(null);
    const newErrors: Record<string, string> = {};

    if (isSignupMode) {
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required.";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (!validatePassword(formData.password)) {
        newErrors.password = "Password does not meet requirements.";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }

      if (userRole === "interviewer") {
        if (!yearsExperience) {
          newErrors.yearsExperience = "Years of experience is required.";
        }
        if (!expertiseArea) {
          newErrors.expertiseArea = "Area of expertise is required.";
        }
        if (!linkedinUrl.trim()) {
          newErrors.linkedinUrl = "LinkedIn URL is required.";
        } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(linkedinUrl)) {
          newErrors.linkedinUrl = "Please enter a valid LinkedIn URL.";
        }
        if (!resumeFile) {
          newErrors.resume = "Resume upload is required.";
        }
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      let redirectPath: string | undefined;

      if (isSignupMode) {
        const registrationData: any = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: userRole,
        };

        // Add interviewer-specific fields
        if (userRole === "interviewer") {
          registrationData.experience = yearsExperience;
          registrationData.expertise = expertiseArea;
          registrationData.linkedin = linkedinUrl;
          if (resumeFile) {
            // Upload the resume file first and get the URL
            const { uploadService } = await import('@/services/upload.service');
            try {
              const uploadResponse = await uploadService.uploadResume(resumeFile);
              registrationData.resume = uploadResponse.data.url;
            } catch (uploadError) {
              toast.error('Failed to upload resume. Please try again.');
              setIsLoading(false);
              return;
            }
          }
        }

        redirectPath = await register(registrationData);

        // Handle trainee signup differently - redirect to login and clear form
        if (userRole === "trainee") {
          // Store the email for pre-filling login form
          const registeredEmail = formData.email;
          
          // Show success message
          toast.success("Account created successfully! Please log in to continue.");
          
          // Logout the automatically logged-in user
          try {
            await logout();
          } catch (logoutError) {
            // If logout fails, still proceed
            console.error('Logout error:', logoutError);
          }
          
          // Clear all form fields except email (which we'll pre-fill)
          setFormData({
            name: "",
            email: registeredEmail, // Pre-fill email for convenience
            password: "",
            confirmPassword: "",
          });
          setYearsExperience("");
          setExpertiseArea("");
          setLinkedinUrl("");
          setResumeFile(null);
          setErrors({});
          setApiError(null);
          setPasswordRequirements({
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
          });
          
          // Switch to login mode
          setIsSignupMode(false);
          
          // Update URL to login mode (remove signup query param) - stay on same page
          navigate(ROUTES.LOGIN, { replace: true });
          
          // Return early to prevent navigation to dashboard
          return;
        } else if (userRole === "interviewer") {
          // For interviewers, continue with normal flow
          toast.success("Account created! Your application is under review.");
          // Navigate based on the redirect path from backend
          if (redirectPath) {
            navigate(redirectPath);
          } else {
            const dashboardPath = getDashboardPath(user?.role || 'trainee');
            navigate(dashboardPath);
          }
          return;
        }

      } else {
        redirectPath = await login(formData.email, formData.password);
        // Don't show welcome message if user is rejected (they'll see rejection notice)
        // Check the redirect path to determine if user is rejected
        if (redirectPath !== '/rejected-notice') {
          toast.success("Welcome back!");
        }
        
        // Navigate based on the redirect path from backend (handles interviewer status)
        // Rejected interviewers should ALWAYS be redirected to rejected notice page
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          // Fallback: navigate based on user role from context
          const dashboardPath = getDashboardPath(user?.role || 'trainee');
          navigate(dashboardPath);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setApiError(errorMessage);
      
      // If user already exists and they're trying to re-apply, suggest using a different email
      if (errorMessage.includes("already exists") && isSignupMode && userRole === "interviewer") {
        toast.error("An account with this email already exists. Please use a different email or contact support if you'd like to update your application.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      toast.success("Resume uploaded successfully!");
    } else {
      toast.error("Please upload a PDF file.");
    }
  };


  const handleGoogleSignup = () => {
    // OAuth without role - user will select role after authentication
    // Role parameter is optional for backward compatibility
    const oauthUrl = authService.getOAuthUrl('google');
    window.location.href = oauthUrl;
  };

  const handleGithubSignup = () => {
    // OAuth without role - user will select role after authentication
    // Role parameter is optional for backward compatibility
    const oauthUrl = authService.getOAuthUrl('github');
    window.location.href = oauthUrl;
  };


  return (
    <AuthBackground variant={isSignupMode ? 'signup' : 'login'}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard>
            <Link
              to={ROUTES.HOME}
              className="flex items-center justify-center space-x-2 mb-8 group"
            >
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                MockRise
              </span>
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">
                {isSignupMode ? "Create Your Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignupMode
                  ? "Start your journey to interview success"
                  : "Continue your interview preparation"}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3 mb-6"
            >
              <EnhancedButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleGoogleSignup()}
                motionProps={{
                  whileHover: { scale: 1.02 },
                  whileTap: { scale: 0.98 }
                }}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </EnhancedButton>
              <EnhancedButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleGithubSignup()}
                motionProps={{
                  whileHover: { scale: 1.02 },
                  whileTap: { scale: 0.98 }
                }}
              >
                <Github className="h-5 w-5 mr-2" />
                Continue with Github
              </EnhancedButton>
            </motion.div>

            <div className="flex items-center my-6">
              <Separator className="flex-1" />
              <span className="mx-4 text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignupMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      validatePassword(e.target.value);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {!isSignupMode && (
                <div className="flex items-center justify-end">
                  <Link to={ROUTES.FORGOT_PASSWORD}>
                    <EnhancedButton
                      type="button"
                      variant="link"
                      className="text-sm text-primary px-0"
                    >
                      Forgot password?
                    </EnhancedButton>
                  </Link>
                </div>
              )}

              {isSignupMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
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

                  <div className="space-y-2">
                    <Label>Choose your role</Label>
                    <RadioGroup
                      defaultValue="trainee"
                      className="flex space-x-4"
                      onValueChange={setUserRole}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="trainee" id="trainee" />
                        <Label htmlFor="trainee">Trainee</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="interviewer" id="interviewer" />
                        <Label htmlFor="interviewer">Interviewer</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {userRole === 'interviewer' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Select onValueChange={setYearsExperience} value={yearsExperience}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-2">0-2 years</SelectItem>
                            <SelectItem value="2-5">2-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.yearsExperience && <p className="text-sm text-destructive">{errors.yearsExperience}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expertiseArea">Area of Expertise *</Label>
                        <Select
                          value={expertiseArea}
                          onValueChange={(value) => setExpertiseArea(value)}
                        >
                          <SelectTrigger id="expertiseArea">
                            <SelectValue placeholder="Select your area of expertise" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(SKILL_TREE).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.expertiseArea && <p className="text-sm text-destructive">{errors.expertiseArea}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="linkedinUrl"
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="pl-10"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                          />
                        </div>
                        {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resume">Upload Resume (PDF)</Label>
                        <div className="relative">
                          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="resume"
                            type="file"
                            accept=".pdf"
                            className="pl-10 file:text-sm file:font-medium file:text-primary"
                            onChange={handleResumeUpload}
                          />
                        </div>
                        {errors.resume && <p className="text-sm text-destructive">{errors.resume}</p>}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {apiError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  {apiError}
                </div>
              )}

              <EnhancedButton
                type="submit"
                className="w-full"
                disabled={isLoading}
                motionProps={{
                  whileHover: { scale: 1.02 },
                  whileTap: { scale: 0.98 }
                }}
              >
                {isLoading ? "Processing..." : (isSignupMode ? "Create Account" : "Log In")}
              </EnhancedButton>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignupMode ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => setIsSignupMode(!isSignupMode)}
                className="font-semibold text-primary hover:underline ml-1"
              >
                {isSignupMode ? "Log In" : "Sign Up"}
              </button>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </AuthBackground>
  );
}