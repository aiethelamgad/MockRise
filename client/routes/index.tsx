import { Routes, Route } from 'react-router-dom';
import { PublicRoutes } from './public.routes';
import { ProtectedRoutes } from './protected.routes';
import NotFound from '@/pages/error/NotFound';
import { ROUTES } from './routes.config';

/**
 * Main router configuration
 */
export const AppRoutes = () => {
    return (
        <Routes>
            {PublicRoutes}
            {ProtectedRoutes}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
    );
};

