import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, UserPlus, MoreVertical, Download, Edit, Eye, Trash2, Mail, Shield, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { userService, User, CreateUserData, UpdateUserData } from '@/services/user.service';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [viewUserOpen, setViewUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [addUserForm, setAddUserForm] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'trainee',
    status: 'approved',
  });
  const [editUserForm, setEditUserForm] = useState<UpdateUserData>({});
  const [newRole, setNewRole] = useState<string>('');
  const [emailData, setEmailData] = useState({ subject: '', message: '' });

  // Fetch users with React Query
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    isFetching: isFetchingUsers,
  } = useQuery({
    queryKey: ['adminUsers', roleFilter, statusFilter, searchQuery, page],
    queryFn: () =>
      userService.getUsers({
        page,
        limit,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching to prevent flickering
    staleTime: 5000, // Consider data fresh for 5 seconds
  });

  const users = usersData?.data || [];
  const pagination = usersData?.pagination;
  const stats = usersData?.stats || {
    total: 0,
    active: 0,
    inactive: 0,
    trainees: 0,
    interviewers: 0,
    admins: 0,
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Shield;
      case "interviewer":
        return UserPlus;
      case "trainee":
        return Search;
      default:
        return Search;
    }
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User created successfully');
      setAddUserOpen(false);
      setAddUserForm({ name: '', email: '', password: '', role: 'trainee', status: 'approved' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  // Handle Add User
  const handleAddUser = () => {
    if (!addUserForm.name || !addUserForm.email || !addUserForm.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (addUserForm.password && addUserForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    createUserMutation.mutate(addUserForm);
  };

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User updated successfully');
      setEditUserOpen(false);
      setSelectedUser(null);
      setEditUserForm({});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  // Handle Edit User
  const handleEditUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({ id: selectedUser._id, data: editUserForm });
  };

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User deleted successfully');
      setDeleteUserOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  // Handle Delete User
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser._id);
  };

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      userService.changeRole(id, { role: role as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated successfully');
      setChangeRoleOpen(false);
      setSelectedUser(null);
      setNewRole('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change user role');
    },
  });

  // Handle Change Role
  const handleChangeRole = () => {
    if (!selectedUser || !newRole) return;
    changeRoleMutation.mutate({ id: selectedUser._id, role: newRole });
  };

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { subject: string; message: string } }) =>
      userService.sendEmail(id, data),
    onSuccess: () => {
      toast.success('Email sent successfully');
      setSendEmailOpen(false);
      setSelectedUser(null);
      setEmailData({ subject: '', message: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send email');
    },
  });

  // Handle Send Email
  const handleSendEmail = () => {
    if (!selectedUser || !emailData.subject || !emailData.message) {
      toast.error('Please fill in subject and message');
      return;
    }
    sendEmailMutation.mutate({ id: selectedUser._id, data: emailData });
  };

  // Handle Export
  const handleExport = async () => {
    try {
      const blob = await userService.exportUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Users exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export users');
    }
  };

  // Open modals
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'approved',
    });
    setEditUserOpen(true);
  };

  const openViewModal = async (user: User) => {
    try {
      const response = await userService.getUserById(user._id);
      setSelectedUser(response.data);
      setViewUserOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load user details');
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setDeleteUserOpen(true);
  };

  const openChangeRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role || 'trainee');
    setChangeRoleOpen(true);
  };

  const openSendEmailModal = (user: User) => {
    setSelectedUser(user);
    setEmailData({ subject: '', message: '' });
    setSendEmailOpen(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">User Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage users, roles, and permissions across the platform
        </p>
      </motion.div>

      {/* Summary Stats */}
      {usersData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
        >
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold mt-1 text-green-500">{stats.active}</p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold mt-1 text-muted-foreground">{stats.inactive}</p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Trainees</p>
            <p className="text-2xl font-bold mt-1">{stats.trainees}</p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Interviewers</p>
            <p className="text-2xl font-bold mt-1">{stats.interviewers}</p>
          </EnhancedCard>
          <EnhancedCard className="p-4" variant="elevated">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold mt-1">{stats.admins}</p>
          </EnhancedCard>
        </motion.div>
      )}

      {/* Search and Filters */}
      <EnhancedCard className="p-6" variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            All Users
          </h2>
          <EnhancedButton onClick={() => setAddUserOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </EnhancedButton>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="interviewer">Interviewer</SelectItem>
              <SelectItem value="trainee">Trainee</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending_verification">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <EnhancedButton variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </EnhancedButton>
        </div>

        {/* Users Table */}
        {isLoadingUsers && !usersData ? (
          <div className="text-center py-8" style={{ minHeight: '200px' }}>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading users...</p>
          </div>
        ) : usersError ? (
          <div className="text-center py-8 text-destructive" style={{ minHeight: '200px' }}>
            Failed to load users. Please try again.
          </div>
        ) : users.length === 0 && !isFetchingUsers ? (
          <div className="text-center py-8 text-muted-foreground" style={{ minHeight: '200px' }}>
            No users found matching your filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0" style={{ opacity: isFetchingUsers && usersData ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <div className="min-w-full inline-block align-middle">
                <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    const userId = user && (typeof user === 'object') 
                      ? (('_id' in user && user._id) || ('id' in user && user.id) || '')
                      : '';
                    const currentUserId = currentUser && (typeof currentUser === 'object')
                      ? (('_id' in currentUser && currentUser._id) || ('id' in currentUser && currentUser.id) || '')
                      : '';
                    const isCurrentUser = currentUserId === userId;

                    return (
                      <TableRow key={String(userId)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.email || 'user'}`} />
                              <AvatarFallback>
                                {(user.name?.split(" ").map(n => n[0]).join("")) || (user.email?.[0]?.toUpperCase() || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.name || 'No name'}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">You</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.email || 'No email'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {RoleIcon && <RoleIcon className="h-4 w-4" />}
                            <span className="text-sm capitalize">{user.role || 'trainee'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(user.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status || 'approved')}>
                            {String(user.status || 'approved').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isCurrentUser}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewModal(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(user)} disabled={isCurrentUser}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openChangeRoleModal(user)} disabled={isCurrentUser}>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openSendEmailModal(user)} disabled={isCurrentUser}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteModal(user)} 
                                className="text-destructive"
                                disabled={isCurrentUser}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </div>
            </div>

            {/* Bottom Summary */}
            <div className="flex items-center justify-center mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {pagination?.total || 0} result{pagination?.total !== 1 ? 's' : ''} out of {stats.total || 0} total
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

      {/* Add User Modal */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={addUserForm.name}
                onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                placeholder="Leave empty for user to set"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={addUserForm.role} onValueChange={(value: any) => setAddUserForm({ ...addUserForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainee">Trainee</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={addUserForm.status} onValueChange={(value: any) => setAddUserForm({ ...addUserForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleAddUser}>
              Create User
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editUserForm.name || selectedUser?.name || ''}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserForm.email || selectedUser?.email || ''}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editUserForm.password || ''}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editUserForm.role || selectedUser?.role} 
                  onValueChange={(value: any) => setEditUserForm({ ...editUserForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainee">Trainee</SelectItem>
                    <SelectItem value="interviewer">Interviewer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editUserForm.status || selectedUser?.status || 'approved'} 
                  onValueChange={(value: any) => setEditUserForm({ ...editUserForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setEditUserOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleEditUser}>
              Save Changes
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={viewUserOpen} onOpenChange={setViewUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name || selectedUser.email}`} />
                  <AvatarFallback>
                    {selectedUser.name?.split(" ").map(n => n[0]).join("") || selectedUser.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name || 'No name'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p className="font-medium">{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedUser.status || 'approved')}>
                    {String(selectedUser.status || 'approved').replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created At</Label>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setViewUserOpen(false)}>
              Close
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name || selectedUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setDeleteUserOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton 
              variant="destructive" 
              onClick={() => {
                handleDeleteUser();
              }}
            >
              Delete
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update the role for {selectedUser?.name || selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-select">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainee">Trainee</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setChangeRoleOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleChangeRole}>
              Update Role
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Modal */}
      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Send an email to {selectedUser?.name || selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject *</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message *</Label>
              <Textarea
                id="email-message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Email message"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setSendEmailOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleSendEmail}>
              Send Email
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}