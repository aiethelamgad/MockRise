import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { interviewerService, PendingInterviewer } from '@/services/interviewer.service';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { uploadService } from '@/services/upload.service';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  User,
  Mail,
  Briefcase,
  Award,
  RefreshCw,
} from 'lucide-react';

export default function PendingInterviewersPage() {
  const [pendingInterviewers, setPendingInterviewers] = useState<PendingInterviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Helper function to get resume URL
  const getResumeUrl = (resume: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // If resume is already a full URL, return it
    if (resume.startsWith('http://') || resume.startsWith('https://')) {
      return resume;
    }
    
    // Extract filename from path if it's a full path like /api/uploads/resumes/filename.pdf
    let filename = resume;
    if (resume.startsWith('/api/uploads/resumes/')) {
      // Extract just the filename from the path (remove the path prefix)
      filename = resume.replace('/api/uploads/resumes/', '');
    }
    
    // If it's just a filename (e.g., "AIETHEL CV 2.pdf"), construct the full URL
    // Encode the filename for URL safety (handles spaces, special chars)
    const encodedFilename = encodeURIComponent(filename);
    return `${baseUrl}/api/uploads/resumes/${encodedFilename}`;
  };

  useEffect(() => {
    fetchPendingInterviewers();
  }, []);

  const fetchPendingInterviewers = async () => {
    try {
      setLoading(true);
      const response = await interviewerService.getPending();
      setPendingInterviewers(response.data);
    } catch (error) {
      // Error handled via toast notification
      toast.error('Failed to load pending interviewers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id);
      const interviewer = pendingInterviewers.find(i => i._id === id);
      await interviewerService.approve(id);
      toast.success('Interviewer approved successfully');
      
      // Add notification for admin
      addNotification({
        title: 'Interviewer Approved',
        message: `${interviewer?.name || 'An interviewer'} has been approved and can now access the dashboard.`,
        type: 'success',
      });

      // Refresh the list
      await fetchPendingInterviewers();
    } catch (error) {
      // Error handled via toast notification
      toast.error('Failed to approve interviewer');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this interviewer application?')) {
      return;
    }

    try {
      setProcessing(id);
      const interviewer = pendingInterviewers.find(i => i._id === id);
      await interviewerService.reject(id);
      toast.success('Interviewer application rejected');
      
      // Add notification for admin
      addNotification({
        title: 'Interviewer Rejected',
        message: `${interviewer?.name || 'An interviewer'} has been rejected.`,
        type: 'info',
      });

      // Refresh the list
      await fetchPendingInterviewers();
    } catch (error) {
      // Error handled via toast notification
      toast.error('Failed to reject interviewer');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pending Interviewer Applications</h1>
            <p className="text-muted-foreground">
              Review and manage interviewer applications awaiting approval
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {pendingInterviewers.length} Pending
                </span>
              )}
            </Badge>
            <EnhancedButton
              variant="outline"
              onClick={fetchPendingInterviewers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </EnhancedButton>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <EnhancedCard className="p-6" variant="elevated">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading pending interviewers...</p>
            </div>
          </div>
        </EnhancedCard>
      ) : pendingInterviewers.length === 0 ? (
        <EnhancedCard className="p-6" variant="elevated">
          <div className="text-center py-16">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Applications</h3>
            <p className="text-muted-foreground">
              There are no pending interviewer applications at this time.
            </p>
          </div>
        </EnhancedCard>
      ) : (
        <EnhancedCard className="p-6" variant="elevated">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {pendingInterviewers.length} application{pendingInterviewers.length !== 1 ? 's' : ''} pending review
            </p>
          </div>

      <div className="space-y-4">
        {pendingInterviewers.map((interviewer, index) => (
          <motion.div
            key={interviewer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {interviewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{interviewer.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {interviewer.email}
                    </span>
                    {interviewer.linkedin && (
                      <a
                        href={interviewer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {interviewer.experience && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Experience</p>
                        <p className="text-muted-foreground">{interviewer.experience}</p>
                      </div>
                    </div>
                  )}
                  {interviewer.expertise && (
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Expertise</p>
                        <p className="text-muted-foreground">{interviewer.expertise}</p>
                      </div>
                    </div>
                  )}
                  {interviewer.resume && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Resume</p>
                        <a
                          href={getResumeUrl(interviewer.resume)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                          onClick={async (e) => {
                            e.preventDefault();
                            const url = getResumeUrl(interviewer.resume);
                            
                            try {
                              const response = await fetch(url, { method: 'HEAD' });
                              if (response.ok) {
                                window.open(url, '_blank');
                              } else {
                                const error = await response.json().catch(() => ({}));
                                toast.error(error.message || 'Resume file not found. The file may need to be re-uploaded.');
                              }
                            } catch {
                              toast.error('Unable to access resume file.');
                            }
                          }}
                        >
                          View Resume
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          {interviewer.resume.includes('/') ? interviewer.resume.split('/').pop() : interviewer.resume}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Applied</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(interviewer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <EnhancedButton
                    onClick={() => handleApprove(interviewer._id)}
                    disabled={processing === interviewer._id}
                    className="bg-success text-success-foreground hover:bg-success/90"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {processing === interviewer._id ? 'Approving...' : 'Approve'}
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => handleReject(interviewer._id)}
                    disabled={processing === interviewer._id}
                    variant="destructive"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing === interviewer._id ? 'Rejecting...' : 'Reject'}
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
          </div>
        </EnhancedCard>
      )}
    </div>
  );
}

