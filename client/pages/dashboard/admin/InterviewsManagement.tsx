import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  Search,
  Filter,
  Clock,
  User,
  Video,
  Star,
  Edit,
  Trash2,
  Eye,
  Loader2,
  MoreVertical,
  Brain,
  Users,
  Heart,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  adminInterviewService,
  type AdminInterview,
  type InterviewMode,
  type InterviewStatus,
} from '@/services/adminInterview.service';
import { userService, type User } from '@/services/user.service';

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];

export default function InterviewsManagement() {
  const queryClient = useQueryClient();
  const [modeFilter, setModeFilter] = useState<InterviewMode | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<AdminInterview | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    status: '' as InterviewStatus | '',
    interviewerId: '',
    timeSlot: '',
    scheduledDate: '',
  });

  // Fetch interviews
  const {
    data: interviewsData,
    isLoading: isLoadingInterviews,
    error: interviewsError,
    isFetching: isFetchingInterviews,
  } = useQuery({
    queryKey: ['adminInterviews', modeFilter, statusFilter, searchQuery, page],
    queryFn: () =>
      adminInterviewService.getInterviews({
        mode: modeFilter,
        status: statusFilter,
        search: searchQuery || undefined,
        page,
        limit: 20,
      }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching to prevent flickering
    staleTime: 5000, // Consider data fresh for 5 seconds
  });

  // Fetch interviewers for edit dropdown
  const { data: interviewersData } = useQuery({
    queryKey: ['approvedInterviewers'],
    queryFn: () => userService.getUsers({ role: 'interviewer', status: 'approved', limit: 100 }),
    enabled: editDialogOpen && selectedInterview?.mode === 'live',
  });

  // Update interview mutation
  const updateMutation = useMutation({
    mutationFn: (data: { status?: InterviewStatus; interviewerId?: string; timeSlot?: string; scheduledDate?: string }) =>
      adminInterviewService.updateInterview(selectedInterview!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInterviews'] });
      toast.success('Interview updated successfully');
      setEditDialogOpen(false);
      setSelectedInterview(null);
      setEditForm({ status: '', interviewerId: '', timeSlot: '', scheduledDate: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update interview');
    },
  });

  // Cancel interview mutation
  const cancelMutation = useMutation({
    mutationFn: () =>
      adminInterviewService.cancelInterview(selectedInterview!._id, {
        reason: cancelReason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInterviews'] });
      toast.success('Interview cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedInterview(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel interview');
    },
  });

  const interviews = interviewsData?.data || [];
  const pagination = interviewsData?.pagination;

  // Open edit dialog
  const handleEdit = (interview: AdminInterview) => {
    setSelectedInterview(interview);
    setEditForm({
      status: interview.status,
      interviewerId: interview.interviewer?.id || '',
      timeSlot: interview.timeSlot,
      scheduledDate: interview.scheduledDate ? interview.scheduledDate.split('T')[0] : '',
    });
    setEditDialogOpen(true);
  };

  // Open cancel dialog
  const handleCancel = (interview: AdminInterview) => {
    setSelectedInterview(interview);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = () => {
    if (!selectedInterview) return;

    const updateData: {
      status?: InterviewStatus;
      interviewerId?: string | null;
      timeSlot?: string;
      scheduledDate?: string;
    } = {};

    if (editForm.status && editForm.status !== selectedInterview.status) {
      updateData.status = editForm.status as InterviewStatus;
    }

    if (selectedInterview.mode === 'live') {
      if (editForm.interviewerId && editForm.interviewerId !== selectedInterview.interviewer?.id) {
        updateData.interviewerId = editForm.interviewerId || null;
      }
      if (editForm.timeSlot && editForm.timeSlot !== selectedInterview.timeSlot) {
        updateData.timeSlot = editForm.timeSlot;
      }
      if (editForm.scheduledDate) {
        updateData.scheduledDate = editForm.scheduledDate;
      }
    }

    if (Object.keys(updateData).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateMutation.mutate(updateData);
  };

  // Get status badge variant
  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="secondary">No Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get mode icon
  const getModeIcon = (mode: InterviewMode) => {
    switch (mode) {
      case 'ai':
        return <Brain className="h-4 w-4" />;
      case 'peer':
        return <Users className="h-4 w-4" />;
      case 'family':
        return <Heart className="h-4 w-4" />;
      case 'live':
        return <Video className="h-4 w-4" />;
    }
  };

  // Get mode label
  const getModeLabel = (mode: InterviewMode) => {
    switch (mode) {
      case 'ai':
        return 'AI-Powered';
      case 'peer':
        return 'Peer-to-Peer';
      case 'family':
        return 'Family & Friends';
      case 'live':
        return 'Live Mock';
    }
  };

  // Format date and time
  const formatDateTime = (dateString: string, timeSlot: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} at ${timeSlot}`;
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Interviews Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage interview sessions across the platform
        </p>
      </motion.div>

      {/* Summary Stats */}
      {interviewsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Total Interviews</p>
            <p className="text-2xl font-bold mt-1">{interviewsData.stats?.total || 0}</p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold mt-1 text-blue-500">
              {interviewsData.stats?.scheduled || 0}
            </p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold mt-1 text-yellow-500">
              {interviewsData.stats?.in_progress || 0}
            </p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold mt-1 text-green-500">
              {interviewsData.stats?.completed || 0}
            </p>
          </EnhancedCard>
        </motion.div>
      )}

      {/* Search and Filters */}
      <EnhancedCard className="p-4 sm:p-6" variant="elevated">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by trainee or interviewer name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={modeFilter}
            onValueChange={(value) => {
              setModeFilter(value as InterviewMode | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="ai">AI-Powered</SelectItem>
              <SelectItem value="peer">Peer-to-Peer</SelectItem>
              <SelectItem value="family">Family & Friends</SelectItem>
              <SelectItem value="live">Live Mock</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as InterviewStatus | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interviews Table */}
        {isLoadingInterviews && !interviewsData ? (
          <div className="text-center py-8" style={{ minHeight: '200px' }}>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading interviews...</p>
          </div>
        ) : interviewsError ? (
          <div className="text-center py-8 text-destructive" style={{ minHeight: '200px' }}>
            Failed to load interviews. Please try again.
          </div>
        ) : interviews.length === 0 && !isFetchingInterviews ? (
          <div className="text-center py-8 text-muted-foreground" style={{ minHeight: '200px' }}>
            No interviews found matching your filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0" style={{ opacity: isFetchingInterviews && interviewsData ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <div className="min-w-full inline-block align-middle">
                <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Trainee</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview._id}>
                      <TableCell className="font-mono text-xs">
                        {interview._id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getModeIcon(interview.mode)}
                          <span className="text-sm">{getModeLabel(interview.mode)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {interview.trainee?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {interview.trainee?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {interview.interviewer ? (
                          <div>
                            <div className="font-medium">{interview.interviewer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {interview.interviewer.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(interview.scheduledDate, interview.timeSlot)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {interview.duration} min
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(interview.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(interview)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {interview.status !== 'cancelled' &&
                              interview.status !== 'completed' && (
                                <DropdownMenuItem
                                  onClick={() => handleCancel(interview)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </div>

            {/* Bottom Summary */}
            <div className="flex items-center justify-center mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {pagination?.total || 0} result{pagination?.total !== 1 ? 's' : ''} out of {interviewsData?.stats?.total || 0} total
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </EnhancedCard>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
            <DialogDescription>
              Update interview details. Changes will be notified to the trainee and interviewer.
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value as InterviewStatus })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedInterview.mode === 'live' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-interviewer">Interviewer</Label>
                    <Select
                      value={editForm.interviewerId}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, interviewerId: value })
                      }
                    >
                      <SelectTrigger id="edit-interviewer">
                        <SelectValue placeholder="Select interviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        {interviewersData?.data
                          .filter((u) => u.status === 'approved')
                          .map((interviewer) => (
                            <SelectItem key={interviewer._id} value={interviewer._id}>
                              {interviewer.name} ({interviewer.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-date">Date</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editForm.scheduledDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, scheduledDate: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-time">Time</Label>
                      <Select
                        value={editForm.timeSlot}
                        onValueChange={(value) =>
                          setEditForm({ ...editForm, timeSlot: value })
                        }
                      >
                        <SelectTrigger id="edit-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this interview? This action will free up the time
              slot and notify both the trainee and interviewer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="cancel-reason">Reason (Optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Interview</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Interview'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
