import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, User, Briefcase, ArrowRight, Loader2, Linkedin, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AuthBackground } from '@/components/auth/auth-background';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { uploadService } from '@/services/upload.service';

export default function OAuthRoleSelection() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'trainee' | 'interviewer' | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Interviewer-specific fields
  const [yearsExperience, setYearsExperience] = useState('');
  const [expertiseArea, setExpertiseArea] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if user doesn't need role selection
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      // User not authenticated - redirect to login
      navigate('/login', { replace: true });
      return;
    }

    // If user doesn't need role selection, redirect them
    if (!user.oauthRolePending) {
      // User already has a role - redirect to appropriate dashboard
      if (user.role === 'interviewer' && user.status === 'pending_verification') {
        navigate('/pending-verification', { replace: true });
      } else if (user.role === 'interviewer' && user.status === 'rejected') {
        navigate('/rejected-notice', { replace: true });
      } else {
        const rolePath = user.role === 'super_admin' ? 'admin' : user.role;
        navigate(`/dashboard/${rolePath}`, { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file only.');
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      setErrors(prev => ({ ...prev, resume: undefined }));
    } else {
      setResumeFile(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedRole) {
      toast.error('Please select a role');
      return false;
    }

    // Validate interviewer-specific fields
    if (selectedRole === 'interviewer') {
      if (!yearsExperience) {
        newErrors.yearsExperience = 'Years of experience is required.';
      }
      if (!expertiseArea.trim()) {
        newErrors.expertiseArea = 'Area of expertise is required.';
      }
      if (!linkedinUrl.trim()) {
        newErrors.linkedinUrl = 'LinkedIn URL is required.';
      } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(linkedinUrl)) {
        newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL.';
      }
      if (!resumeFile) {
        newErrors.resume = 'Resume upload is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = async () => {
    if (!validateForm()) {
      return;
    }

    setIsAssigning(true);

    try {
      const roleData: any = {
        role: selectedRole,
      };

      // Add interviewer-specific fields
      if (selectedRole === 'interviewer') {
        roleData.experience = yearsExperience;
        roleData.expertise = expertiseArea;
        roleData.linkedin = linkedinUrl;
        
        // Upload resume file first
        if (resumeFile) {
          try {
            const uploadResponse = await uploadService.uploadResume(resumeFile);
            roleData.resume = uploadResponse.data.url;
          } catch (uploadError: any) {
            toast.error(uploadError.message || 'Failed to upload resume. Please try again.');
            setIsAssigning(false);
            return;
          }
        }
      }

      const response = await authService.assignRole(roleData);
      
      if (response.success) {
        toast.success(`Role assigned successfully! Welcome as a ${selectedRole}.`);
        
        // Refresh user data and redirect
        // The redirect path is provided by the backend
        if (response.redirect) {
          // Reload page to refresh auth context with new role
          window.location.href = response.redirect;
        } else {
          // Fallback redirect
          if (selectedRole === 'interviewer') {
            navigate('/pending-verification', { replace: true });
          } else {
            navigate('/dashboard/trainee', { replace: true });
          }
        }
      }
    } catch (error: any) {
      // Error handling done via toast notifications
      toast.error(error.message || 'Failed to assign role. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (authLoading) {
    return (
      <AuthBackground>
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <EnhancedCard className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </EnhancedCard>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <EnhancedCard className="p-8 space-y-6" variant="glass">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-2">Choose Your Role</h2>
              <p className="text-muted-foreground">
                Please select the role that best describes you
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              {/* Trainee Role Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <EnhancedCard
                  className={`p-6 cursor-pointer transition-all ${
                    selectedRole === 'trainee'
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  variant="elevated"
                  onClick={() => {
                    setSelectedRole('trainee');
                    // Clear interviewer fields when switching to trainee
                    setYearsExperience('');
                    setExpertiseArea('');
                    setLinkedinUrl('');
                    setResumeFile(null);
                    setErrors({});
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className={`p-4 rounded-full ${
                        selectedRole === 'trainee'
                          ? 'bg-primary/10'
                          : 'bg-muted'
                      }`}
                    >
                      <User className={`h-8 w-8 ${
                        selectedRole === 'trainee'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Trainee</h3>
                      <p className="text-sm text-muted-foreground">
                        Practice interview skills and get feedback to improve your performance
                      </p>
                    </div>
                    {selectedRole === 'trainee'}
                  </div>
                </EnhancedCard>
              </motion.div>

              {/* Interviewer Role Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <EnhancedCard
                  className={`p-6 cursor-pointer transition-all ${
                    selectedRole === 'interviewer'
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  variant="elevated"
                  onClick={() => {
                    setSelectedRole('interviewer');
                    // Clear errors when selecting interviewer
                    setErrors({});
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className={`p-4 rounded-full ${
                        selectedRole === 'interviewer'
                          ? 'bg-primary/10'
                          : 'bg-muted'
                      }`}
                    >
                      <Briefcase className={`h-8 w-8 ${
                        selectedRole === 'interviewer'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Interviewer</h3>
                      <p className="text-sm text-muted-foreground">
                        Conduct interviews and help trainees improve. Requires admin approval.
                      </p>
                    </div>
                    {selectedRole === 'interviewer'}
                  </div>
                </EnhancedCard>
              </motion.div>
            </div>

            {/* Interviewer-specific fields */}
            {selectedRole === 'interviewer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mt-4 pt-4 border-t border-border"
              >
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Please complete the following information. This will help reduce the chance of rejection.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
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
                  {errors.yearsExperience && (
                    <p className="text-sm text-destructive">{errors.yearsExperience}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertiseArea">Area of Expertise *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expertiseArea"
                      type="text"
                      placeholder="e.g., Frontend Development, UX/UI Design"
                      className="pl-10"
                      value={expertiseArea}
                      onChange={(e) => {
                        setExpertiseArea(e.target.value);
                        setErrors(prev => ({ ...prev, expertiseArea: undefined }));
                      }}
                    />
                  </div>
                  {errors.expertiseArea && (
                    <p className="text-sm text-destructive">{errors.expertiseArea}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile *</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="pl-10"
                      value={linkedinUrl}
                      onChange={(e) => {
                        setLinkedinUrl(e.target.value);
                        setErrors(prev => ({ ...prev, linkedinUrl: undefined }));
                      }}
                    />
                  </div>
                  {errors.linkedinUrl && (
                    <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Upload Resume (PDF only) *</Label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      className="pl-10 file:text-sm file:font-medium file:text-primary"
                      onChange={handleResumeUpload}
                    />
                  </div>
                  {resumeFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {resumeFile.name}
                    </p>
                  )}
                  {errors.resume && (
                    <p className="text-sm text-destructive">{errors.resume}</p>
                  )}
                </div>
              </motion.div>
            )}

            <EnhancedButton
              onClick={handleRoleSelect}
              disabled={!selectedRole || isAssigning}
              className="w-full mt-6"
              motionProps={{
                whileHover: { scale: 1.02 },
                whileTap: { scale: 0.98 }
              }}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {selectedRole === 'interviewer' ? 'Submitting Application...' : 'Assigning Role...'}
                </>
              ) : (
                <>
                  {selectedRole === 'interviewer' ? 'Submit Application' : 'Continue'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </EnhancedButton>
          </EnhancedCard>
        </motion.div>
      </div>
    </AuthBackground>
  );
}

