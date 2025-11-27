import { Route } from 'react-router-dom';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ROUTES } from './routes.config';

// Trainee pages
import Dashboard from '@/pages/dashboard/trainee/Dashboard';
import Schedule from '@/pages/dashboard/trainee/Schedule';
import MySessions from '@/pages/dashboard/trainee/MySessions';
import SessionScreen from '@/pages/dashboard/trainee/SessionScreen';
import RescheduleSession from '@/pages/dashboard/trainee/RescheduleSession';
import SpeechAnalysis from '@/pages/dashboard/trainee/SpeechAnalysis';
import Feedback from '@/pages/dashboard/trainee/Feedback';
import DashboardSettings from '@/pages/dashboard/trainee/Settings';
import Notifications from '@/pages/dashboard/shared/Notifications';

// Interviewer pages
import InterviewerDashboard from '@/pages/dashboard/interviewer/Dashboard';
import AssignedInterviews from '@/pages/dashboard/interviewer/AssignedInterviews';
import InterviewerCalendar from '@/pages/dashboard/interviewer/InterviewerCalendar';
import QuestionBank from '@/pages/dashboard/interviewer/QuestionBank';
import FeedbackReview from '@/pages/dashboard/interviewer/FeedbackReview';
import PerformanceStats from '@/pages/dashboard/interviewer/PerformanceStats';
import AvailabilityManager from '@/pages/dashboard/interviewer/AvailabilityManager';

// Admin pages
import AdminDashboard from '@/pages/dashboard/admin/Dashboard';
import PendingInterviewersPage from '@/pages/dashboard/admin/PendingInterviewers';
import UsersManagement from '@/pages/dashboard/admin/UsersManagement';
import InterviewsManagement from '@/pages/dashboard/admin/InterviewsManagement';
import ResourcesManagement from '@/pages/dashboard/admin/ResourcesManagement';
import AdminAnalytics from '@/pages/dashboard/admin/AdminAnalytics';
import SystemConfig from '@/pages/dashboard/admin/SystemConfig';
import AdminProfile from '@/pages/dashboard/admin/Profile';

/**
 * Protected routes - require authentication
 */
export const ProtectedRoutes = (
    <>
        {/* Trainee Dashboard Routes */}
        <Route
            path={ROUTES.TRAINEE_DASHBOARD}
            element={
                <RouteGuard requiredRoles={['trainee']}>
                    <DashboardLayout />
                </RouteGuard>
            }
        >
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="sessions" element={<MySessions />} />
            <Route path="sessions/:sessionId" element={<SessionScreen />} />
            <Route path="sessions/:sessionId/reschedule" element={<RescheduleSession />} />
            <Route path="speech-analysis" element={<SpeechAnalysis />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Interviewer Dashboard Routes */}
        <Route
            path={ROUTES.INTERVIEWER_DASHBOARD}
            element={
                <RouteGuard requiredRoles={['interviewer']}>
                    <DashboardLayout />
                </RouteGuard>
            }
        >
            <Route index element={<InterviewerDashboard />} />
            <Route path="assigned" element={<AssignedInterviews />} />
            <Route path="calendar" element={<InterviewerCalendar />} />
            <Route path="availability" element={<AvailabilityManager />} />
            <Route path="questions" element={<QuestionBank />} />
            <Route path="feedback" element={<FeedbackReview />} />
            <Route path="stats" element={<PerformanceStats />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
                <RouteGuard requiredRoles={['admin', 'super_admin', 'hr_admin']}>
                    <DashboardLayout />
                </RouteGuard>
            }
        >
            <Route index element={<AdminDashboard />} />
            <Route path="pending-interviewers" element={<PendingInterviewersPage />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="interviews" element={<InterviewsManagement />} />
            <Route path="resources" element={<ResourcesManagement />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route
                path="config"
                element={
                    <RouteGuard requiredRoles={['admin']}>
                        <SystemConfig />
                    </RouteGuard>
                }
            />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="notifications" element={<Notifications />} />
        </Route>
    </>
);

