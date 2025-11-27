import { Route } from 'react-router-dom';
import Landing from '@/pages/public/Landing';
import Login from '@/pages/public/Login';
import ForgotPassword from '@/pages/public/ForgotPassword';
import ResetPassword from '@/pages/public/ResetPassword';
import Pricing from '@/pages/public/Pricing';
import Resources from '@/pages/public/Resources';
// import HelpCenter from '@/pages/public/HelpCenter';
import FAQ from '@/pages/public/FAQ';
import StyleGuide from '@/pages/public/StyleGuide';
import PendingVerification from '@/pages/auth/PendingVerification';
import RejectedNotice from '@/pages/auth/RejectedNotice';
import OAuthRoleSelection from '@/pages/auth/OAuthRoleSelection';
import Unauthorized from '@/pages/error/Unauthorized';
import { ROUTES } from './routes.config';

/**
 * Public routes - accessible without authentication
 */
export const PublicRoutes = (
    <>
        <Route path={ROUTES.HOME} element={<Landing />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={ROUTES.PRICING} element={<Pricing />} />
        <Route path={ROUTES.RESOURCES} element={<Resources />} />
        {/* <Route path={ROUTES.HELP} element={<HelpCenter />} /> */}
        <Route path={ROUTES.FAQ} element={<FAQ />} />
        <Route path={ROUTES.STYLE_GUIDE} element={<StyleGuide />} />
        <Route path={ROUTES.PENDING_VERIFICATION} element={<PendingVerification />} />
        <Route path={ROUTES.REJECTED_NOTICE} element={<RejectedNotice />} />
        <Route path={ROUTES.OAUTH_ROLE_SELECTION} element={<OAuthRoleSelection />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
    </>
);

